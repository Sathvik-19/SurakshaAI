from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
import sqlite3, os, uuid, math, random, secrets

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, 'suraksha.db')
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

SEVERITIES = ['SAFE', 'MODERATE', 'HIGH', 'CRITICAL']

def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def now(): return datetime.now(timezone.utc).isoformat()

def init_db():
    con = db(); cur = con.cursor()
    cur.executescript('''
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS password_resets(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at TEXT NOT NULL,used INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS grid_cells(id TEXT PRIMARY KEY,cell_code TEXT UNIQUE,label TEXT,center_lat REAL,center_lng REAL,min_lat REAL,max_lat REAL,min_lng REAL,max_lng REAL,elevation_m REAL,drainage_score REAL,historical_flood_flag INTEGER,near_coast INTEGER,urban_density REAL);
    CREATE TABLE IF NOT EXISTS risk_zones(id TEXT PRIMARY KEY,grid_cell_id TEXT,risk_score REAL,severity_level TEXT,rain_score REAL,flood_score REAL,lightning_score REAL,wind_score REAL,population_score REAL,vulnerability_score REAL,explanation TEXT,computed_at TEXT);
    CREATE TABLE IF NOT EXISTS weather_records(id TEXT PRIMARY KEY,grid_cell_id TEXT,recorded_at TEXT,rainfall_mm REAL,temperature_c REAL,humidity_pct REAL,wind_speed_kmph REAL,pressure_hpa REAL,source TEXT);
    CREATE TABLE IF NOT EXISTS predictions(id TEXT PRIMARY KEY,grid_cell_id TEXT,horizon_minutes INTEGER,rainfall_forecast_mm REAL,flood_probability REAL,lightning_probability REAL,wind_forecast_kmph REAL,confidence_score REAL);
    CREATE TABLE IF NOT EXISTS infrastructure(id TEXT PRIMARY KEY,type TEXT,name TEXT,lat REAL,lng REAL,grid_cell_id TEXT);
    CREATE TABLE IF NOT EXISTS population_exposure(id TEXT PRIMARY KEY,grid_cell_id TEXT,total_population INTEGER,children INTEGER,elderly INTEGER);
    CREATE TABLE IF NOT EXISTS alerts(id TEXT PRIMARY KEY,grid_cell_id TEXT,audience_role TEXT,severity TEXT,message TEXT,language TEXT,sent_at TEXT);
    CREATE TABLE IF NOT EXISTS historical_events(id TEXT PRIMARY KEY,event_type TEXT,event_date TEXT,affected_grid_cells INTEGER,severity TEXT,notes TEXT);
    CREATE TABLE IF NOT EXISTS model_results(id TEXT PRIMARY KEY,model_name TEXT,metric_name TEXT,metric_value REAL,evaluated_at TEXT);
    ''')
    if cur.execute('SELECT COUNT(*) FROM grid_cells').fetchone()[0] == 0:
        seed(con)
    demo_accounts=[('citizen@suraksha.ai','Demo Citizen','CITIZEN'),('authority@suraksha.ai','Demo Authority','AUTHORITY'),('admin@suraksha.ai','Demo Admin','ADMIN')]
    for email,name,role in demo_accounts:
        if cur.execute('SELECT 1 FROM users WHERE email=?',(email,)).fetchone() is None:
            cur.execute('INSERT INTO users VALUES (?,?,?,?,?,?)',(str(uuid.uuid4()),email,generate_password_hash('Suraksha@123'),name,role,now()))
    con.commit(); con.close()

def seed(con):
    random.seed(42)
    labels = ['Mangaluru Central','Kottara','Bajpe','Surathkal','Panambur','Kadri','Bejai','Kavoor','Ullal','Mulki','Moodbidri','Pumpwell']
    base_lat, base_lng = 12.9141, 74.8560
    cells=[]
    for i,label in enumerate(labels):
        lat = base_lat + ((i % 4)-1.5)*0.035
        lng = base_lng + ((i // 4)-1.0)*0.055
        cell_id=str(uuid.uuid4())
        cells.append((cell_id,f'MNG-{i+1:02d}',label,lat,lng,lat-.02,lat+.02,lng-.025,lng+.025,random.randint(5,80),round(random.uniform(.2,.9),2),int(i in [1,3,8,9]),int(i in [0,3,4,8,9]),round(random.uniform(.35,.95),2)))
    con.executemany('INSERT INTO grid_cells VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',cells)
    for idx,c in enumerate(cells):
        rain = min(1, .25 + (idx%5)*.13 + random.uniform(-.05,.08))
        flood=min(1, rain*.8 + random.uniform(0,.22))
        lightning=min(1, .15 + random.random()*.65)
        wind=min(1, .18 + random.random()*.55)
        pop=min(1, .2 + random.random()*.75)
        vuln=min(1, .2 + c[-1]*.55 + random.random()*.25)
        score=round(min(100, rain*25+flood*25+lightning*15+wind*10+pop*10+vuln*15),1)
        sev='CRITICAL' if score>=75 else 'HIGH' if score>=55 else 'MODERATE' if score>=30 else 'SAFE'
        explanation=f'[{{"label":"Rainfall","value":{round(rain,2)},"impact":"Rain intensity is contributing to risk."}},{{"label":"Flood probability","value":{round(flood,2)},"impact":"Drainage and recent rainfall increase flood potential."}},{{"label":"Lightning","value":{round(lightning,2)},"impact":"Thunderstorm activity is being monitored."}}]'
        con.execute('INSERT INTO risk_zones VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',(str(uuid.uuid4()),c[0],score,sev,rain,flood,lightning,wind,pop,vuln,explanation,now()))
        con.execute('INSERT INTO weather_records VALUES (?,?,?,?,?,?,?,?,?)',(str(uuid.uuid4()),c[0],now(),round(rain*35,1),round(25+random.random()*6,1),round(68+random.random()*25,1),round(wind*60,1),round(1005+random.random()*10,1),'SIMULATED'))
        for horizon in [30,60,120]:
            factor=1+(horizon/240)*.18
            con.execute('INSERT INTO predictions VALUES (?,?,?,?,?,?,?,?)',(str(uuid.uuid4()),c[0],horizon,round(rain*35*factor,1),round(min(1,flood*factor),2),round(min(1,lightning*factor),2),round(wind*60*factor,1),round(.82-random.random()*.12,2)))
        total=random.randint(1800,9000)
        con.execute('INSERT INTO population_exposure VALUES (?,?,?,?,?)',(str(uuid.uuid4()),c[0],total,round(total*.17),round(total*.09)))
    types=[('hospital','KMC Hospital'),('school','Surathkal Public School'),('police','Mangaluru Police Control'),('fire_station','Kadri Fire Station'),('shelter','City Emergency Shelter'),('bridge','Netravati Bridge')]
    for i,(typ,name) in enumerate(types):
        c=cells[i*2 % len(cells)]
        con.execute('INSERT INTO infrastructure VALUES (?,?,?,?,?,?)',(str(uuid.uuid4()),typ,name,c[3],c[4],c[0]))
    con.execute('INSERT INTO infrastructure VALUES (?,?,?,?,?,?)',(str(uuid.uuid4()),'school','Coastal Model School',cells[7][3],cells[7][4],cells[7][0]))
    riskrows=con.execute('SELECT grid_cell_id,severity_level FROM risk_zones').fetchall()
    for i,(cid,sev) in enumerate(riskrows):
        if sev in ('HIGH','CRITICAL'):
            con.execute('INSERT INTO alerts VALUES (?,?,?,?,?,?,?)',(str(uuid.uuid4()),cid,'ALL',sev,f'Weather risk elevated in the monitored zone. Follow local safety guidance and avoid waterlogged roads.','en',now()))
    for typ, date, sev, note in [('flood','2025-07-15','HIGH','Heavy monsoon flooding affected low-lying corridors.'),('lightning','2025-08-02','MODERATE','Thunderstorm activity increased across the coastal belt.'),('landslide','2024-07-28','HIGH','Slope instability reported after prolonged rainfall.'),('heavy_rain','2024-06-19','CRITICAL','Exceptional rainfall caused widespread disruption.')]:
        con.execute('INSERT INTO historical_events VALUES (?,?,?,?,?,?)',(str(uuid.uuid4()),typ,date,len(cells)//2,sev,note))
    metrics=[('Suraksha Risk Engine','MAE',6.8),('Suraksha Risk Engine','RMSE',9.4),('Suraksha Risk Engine','R2',.91),('Flood Classifier','precision',.89),('Flood Classifier','recall',.86),('Flood Classifier','F1',.875)]
    for model,metric,val in metrics: con.execute('INSERT INTO model_results VALUES (?,?,?,?,?)',(str(uuid.uuid4()),model,metric,val,now()))

def rows(q,args=()):
    con=db(); data=[dict(r) for r in con.execute(q,args).fetchall()]; con.close(); return data

def one(q,args=()):
    con=db(); r=con.execute(q,args).fetchone(); con.close(); return dict(r) if r else None

def current_user():
    token=request.headers.get('Authorization','').replace('Bearer ','').strip()
    if not token: return None
    return one('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=?',(token,))

@app.get('/api/health')
def health(): return jsonify({'status':'ok','service':'Suraksha AI Python Backend','time':now()})

@app.post('/api/auth/register')
def register():
    d=request.get_json() or {}; email=d.get('email','').strip().lower(); password=d.get('password',''); name=d.get('name','').strip(); role=d.get('role','CITIZEN')
    if not email or len(password)<6 or not name: return jsonify({'error':'Name, email and a 6+ character password are required.'}),400
    if role not in ('CITIZEN','AUTHORITY','ADMIN'): role='CITIZEN'
    con=db()
    try:
        uid=str(uuid.uuid4()); con.execute('INSERT INTO users VALUES (?,?,?,?,?,?)',(uid,email,generate_password_hash(password),name,role,now()))
        token=str(uuid.uuid4()); con.execute('INSERT INTO sessions VALUES (?,?,?)',(token,uid,now())); con.commit()
        return jsonify({'token':token,'user':{'id':uid,'email':email,'name':name,'role':role}})
    except sqlite3.IntegrityError: return jsonify({'error':'An account with this email already exists.'}),409
    finally: con.close()

@app.post('/api/auth/login')
def login():
    d=request.get_json() or {}; user=one('SELECT * FROM users WHERE email=?',(d.get('email','').strip().lower(),))
    if not user or not check_password_hash(user['password_hash'],d.get('password','')): return jsonify({'error':'Invalid email or password.'}),401
    token=str(uuid.uuid4()); con=db(); con.execute('INSERT INTO sessions VALUES (?,?,?)',(token,user['id'],now())); con.commit(); con.close()
    return jsonify({'token':token,'user':{'id':user['id'],'email':user['email'],'name':user['name'],'role':user['role']}})

@app.post('/api/auth/forgot-password')
def forgot_password():
    d=request.get_json() or {}; email=d.get('email','').strip().lower(); user=one('SELECT * FROM users WHERE email=?',(email,))
    if not user: return jsonify({'message':'If an account exists for this email, a reset code has been generated.'})
    token=secrets.token_urlsafe(24); expires=(datetime.now(timezone.utc)+timedelta(minutes=15)).isoformat()
    con=db(); con.execute('INSERT INTO password_resets VALUES (?,?,?,0)',(token,user['id'],expires)); con.commit(); con.close()
    return jsonify({'message':'Reset code generated. It expires in 15 minutes.','reset_token':token})

@app.post('/api/auth/reset-password')
def reset_password():
    d=request.get_json() or {}; email=d.get('email','').strip().lower(); token=d.get('reset_token','').strip(); password=d.get('password','')
    if len(password)<6 or not token or not email: return jsonify({'error':'Email, reset code and a 6+ character password are required.'}),400
    user=one('SELECT * FROM users WHERE email=?',(email,)); reset=one('SELECT * FROM password_resets WHERE token=? AND used=0',(token,))
    if not user or not reset or reset['user_id']!=user['id'] or reset['expires_at'] < now(): return jsonify({'error':'Invalid or expired reset code.'}),400
    con=db(); con.execute('UPDATE users SET password_hash=? WHERE id=?',(generate_password_hash(password),user['id'])); con.execute('UPDATE password_resets SET used=1 WHERE token=?',(token,)); con.execute('DELETE FROM sessions WHERE user_id=?',(user['id'],)); con.commit(); con.close()
    return jsonify({'message':'Password reset successful.'})

@app.get('/api/auth/me')
def me():
    u=current_user()
    if not u: return jsonify({'user':None}),401
    return jsonify({'user':{'id':u['id'],'email':u['email'],'name':u['name'],'role':u['role']}})

@app.post('/api/auth/logout')
def logout():
    token=request.headers.get('Authorization','').replace('Bearer ','').strip(); con=db(); con.execute('DELETE FROM sessions WHERE token=?',(token,)); con.commit(); con.close(); return jsonify({'ok':True})

@app.get('/api/grid-cells')
def grid_cells(): return jsonify(rows('SELECT * FROM grid_cells ORDER BY cell_code'))

@app.get('/api/risk-zones')
def risk_zones():
    data=rows('SELECT * FROM risk_zones ORDER BY computed_at DESC'); seen=set(); out=[]
    for r in data:
        if r['grid_cell_id'] not in seen: seen.add(r['grid_cell_id']); r['explanation']=__import__('json').loads(r['explanation']); out.append(r)
    return jsonify(out)

@app.get('/api/infrastructure')
def infrastructure(): return jsonify(rows('SELECT * FROM infrastructure'))

@app.get('/api/alerts')
def alerts():
    role=request.args.get('role'); lang=request.args.get('lang'); q='SELECT * FROM alerts WHERE 1=1'; args=[]
    if role and role!='ALL': q+=' AND (audience_role=? OR audience_role=\'ALL\')'; args.append(role)
    if lang: q+=' AND (language=? OR language=\'en\')'; args.append(lang)
    q+=' ORDER BY sent_at DESC LIMIT 50'; return jsonify(rows(q,args))

@app.get('/api/historical-events')
def history(): return jsonify(rows('SELECT * FROM historical_events ORDER BY event_date DESC'))
@app.get('/api/model-results')
def models(): return jsonify(rows('SELECT * FROM model_results'))

@app.get('/api/zones/<cell_id>')
def zone_detail(cell_id):
    cell=one('SELECT * FROM grid_cells WHERE id=?',(cell_id,))
    if not cell: return jsonify({'error':'Zone not found'}),404
    risk=one('SELECT * FROM risk_zones WHERE grid_cell_id=? ORDER BY computed_at DESC LIMIT 1',(cell_id,))
    if risk: risk['explanation']=__import__('json').loads(risk['explanation'])
    return jsonify({'gridCell':cell,'risk':risk,'weather':rows('SELECT * FROM weather_records WHERE grid_cell_id=? ORDER BY recorded_at DESC LIMIT 10',(cell_id,)),'predictions':rows('SELECT * FROM predictions WHERE grid_cell_id=? ORDER BY horizon_minutes',(cell_id,)),'population':one('SELECT * FROM population_exposure WHERE grid_cell_id=?',(cell_id,)),'infrastructure':rows('SELECT * FROM infrastructure WHERE grid_cell_id=?',(cell_id,))})

@app.post('/api/copilot')
def copilot():
    q=(request.get_json() or {}).get('question','').lower()
    zones=rows('SELECT g.label,r.* FROM risk_zones r JOIN grid_cells g ON g.id=r.grid_cell_id')
    alerts=rows('SELECT * FROM alerts ORDER BY sent_at DESC LIMIT 50')
    critical=[z for z in zones if z['severity_level']=='CRITICAL']; high=[z for z in zones if z['severity_level']=='HIGH']; moderate=[z for z in zones if z['severity_level']=='MODERATE']; safe=[z for z in zones if z['severity_level']=='SAFE']
    if any(x in q for x in ('safe','my area','is it')):
        if critical:
            z=critical[0]; text=f"{z['label']} is currently CRITICAL with a risk score of {z['risk_score']}/100. Stay indoors, avoid low-lying areas and follow official evacuation instructions. There are {len(alerts)} active alerts."
        elif high:
            z=high[0]; text=f"{z['label']} is currently HIGH risk ({z['risk_score']}/100). Heavy rainfall and possible flooding are the main concerns."
        elif moderate: text=f"Most monitored areas are MODERATE risk. {len(moderate)} zones need caution, but no critical zone is currently dominant."
        else: text='All monitored zones are currently SAFE.'
    elif any(x in q for x in ('rain','weather','flood')):
        z=max(zones,key=lambda x:x['rain_score'],default=None); text=f"The highest rainfall risk is in {z['label']} at {round(z['rain_score']*100)}%. Flood probability is {round(z['flood_score']*100)}%." if z else 'No weather data is available.'
    elif any(x in q for x in ('alert','warning')): text=f"There are {len(alerts)} active alerts, including {sum(a['severity']=='CRITICAL' for a in alerts)} critical and {sum(a['severity']=='HIGH' for a in alerts)} high-severity alerts."
    elif any(x in q for x in ('route','travel','go')): text='Avoid currently HIGH and CRITICAL zones. Use the Live Risk Map to compare risk-aware routes and nearby infrastructure.'
    elif any(x in q for x in ('school','hospital','infrastructure')): text='Open the Live Risk Map and enable infrastructure layers to see hospitals, schools, police, shelters and bridges relative to risk zones.'
    elif 'simulation' in q or 'simulate' in q: text='The Disaster Simulation module models changing risk over a 120-minute severe-weather scenario.'
    else: text=f'I can help with risk, weather, alerts, safe travel and simulations. Current status: {len(critical)} critical, {len(high)} high, {len(moderate)} moderate and {len(safe)} safe zones.'
    return jsonify({'answer':text})

@app.post('/api/simulate')
def simulate():
    d=request.get_json() or {}; cell_id=d.get('cell_id'); detail=one('SELECT * FROM risk_zones WHERE grid_cell_id=? ORDER BY computed_at DESC LIMIT 1',(cell_id,)) if cell_id else None
    base=(detail['risk_score'] if detail else 45)
    points=[]
    for minute in range(0,121,10):
        wave=math.sin(minute/35)*3 + minute*.12
        score=max(0,min(100,base+wave))
        sev='CRITICAL' if score>=75 else 'HIGH' if score>=55 else 'MODERATE' if score>=30 else 'SAFE'
        points.append({'minute':minute,'risk_score':round(score,1),'severity':sev})
    return jsonify({'points':points})

if __name__=='__main__':
    init_db(); app.run(host='0.0.0.0',port=int(os.getenv('PORT','5000')),debug=os.getenv('FLASK_DEBUG','0')=='1')
