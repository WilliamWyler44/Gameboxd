import sqlite3
conn=sqlite3.connect('gameboxd.db')
cur=conn.cursor()
print('Tables:')
for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
    print(row)
print('\nGame entries:')
for r in cur.execute('SELECT id,user_id,rawg_id,title,status,added_at FROM game_entries ORDER BY added_at DESC').fetchall():
    print(r)
print('\nUsers:')
for r in cur.execute('SELECT id,username,email FROM users').fetchall():
    print(r)
conn.close()
