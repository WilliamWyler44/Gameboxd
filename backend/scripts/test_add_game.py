import requests, uuid, os
API='http://127.0.0.1:8001'
name = f'test_add_{uuid.uuid4().hex[:8]}'
print('Signing up user', name)
res = requests.post(f'{API}/signup', json={'username':name,'email':f'{name}@example.com','password':'password123'})
print('signup', res.status_code, res.text)
res = requests.post(f'{API}/token', data={'username':name,'password':'password123'})
print('token', res.status_code, res.text)
if res.status_code!=200:
    raise SystemExit()
token = res.json().get('access_token')
print('token ok')
# Try to add a known RAWG id. Use 12270 (RollerCoaster Tycoon Classic?)
payload = {'rawg_id': 12270, 'status':'playing', 'rating':8, 'review':'Test add via script'}
headers = {'Authorization':f'Bearer {token}','Content-Type':'application/json'}
res = requests.post(f'{API}/games', json=payload, headers=headers)
print('/games', res.status_code, res.text)
# list games
res = requests.get(f'{API}/games', headers={'Authorization':f'Bearer {token}'})
print('/games list', res.status_code, res.text)
