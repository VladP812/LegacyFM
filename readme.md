<h1 align="center">Durhack 25</h1>

<h2 align="center">Setup</h2>

- Open /frontend, run ```npm i```
- Repeat for /backend and /shared
- Create .env.development files in /frontend and /backend
- Keep .env.development empty for /backend
- Add VITE_BACKEND_URL=http://localhost:11337 to /frontend/.env.development
- In /frontend run ```npm run dev```
- In /backend run ```npm run dev```

Now you should be able to open and test everything via http://localhost:5173

