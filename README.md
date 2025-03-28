# TypistFlow - Advanced Typing Test Application

TypistFlow is a sophisticated typing test application featuring multiple challenge modes, real-time feedback, and detailed performance analytics.

## 🚀 Features

- **Multiple Typing Modes**:
  - **Standard**: Type text as displayed
  - **Reverse**: Type text that appears in reversed order (mirror-like display)
  - **Jumbled**: Type correctly while unscrambling jumbled middle letters

- **Real-time Feedback**: Character-by-character feedback with visual cues
- **Detailed Analytics**: Speed (WPM), accuracy, and text comparison after completion
- **Modern UI**: Clean interface with attractive styling and visual effects

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or later recommended)
- npm (included with Node.js) or [Yarn](https://yarnpkg.com/)

## 🔧 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/typistflow-frontend.git
cd typistflow-frontend
```

2. **Install dependencies**

Using npm:
```bash
npm install
```

Or using Yarn:
```bash
yarn install
```

## 🏃‍♂️ Running the Application

### Development Mode

To start the development server with SSR (Server-Side Rendering):

```bash
npm run dev
```

Or with Yarn:
```bash
yarn dev
```

The application should be available at [http://localhost:5173](http://localhost:5173)

### Production Build

To create an optimized production build:

```bash
npm run build
```

This will:
1. Build the client-side assets to `dist/client`
2. Build the server-side rendering code to `dist/server`

To preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
typistflow-frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   ├── styles/         # CSS modules and global styles
│   ├── data/           # Data files (sentences database)
│   ├── App.jsx         # Main application component
│   ├── entry-client.jsx # Client entry point
│   └── entry-server.jsx # Server-side rendering entry point
├── server.js           # Express server for SSR
├── package.json        # Project dependencies and scripts
└── index.html          # HTML template
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Port already in use**: If port 5173 is already in use, you may see errors on startup.
   Solution: Change the port in server.js by setting the PORT environment variable:
   ```bash
   PORT=3000 npm run dev
   ```

2. **Node version compatibility**: Ensure you're using a compatible Node.js version.
   Check your version with `node -v`. Recommend using Node.js 16.x or higher.

3. **Missing dependencies**: If you encounter errors about missing modules:
   ```bash
   npm install
   ```

4. **Build errors**: Try clearing the node_modules folder and reinstalling dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

5. **SSR-related errors**: If facing issues with server-side rendering:
   - Check that you have the necessary entry-server.jsx and entry-client.jsx files
   - Ensure your components are isomorphic (work in both browser and Node environments)

## 🌐 Deployment

### Platform Setup

This application uses server-side rendering (SSR), so it requires a Node.js hosting environment. Recommended platforms:

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Configure build settings in the Vercel dashboard:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Digital Ocean / Heroku / Any Node.js platform

1. Make sure to set production environment:
   ```
   NODE_ENV=production
   ```

2. Start the server:
   ```
   node server.js
   ```

3. You can use a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start server.js
   ```

### GitHub Pages (Static Export Alternative)

If you want to deploy as a static site without SSR:

1. Modify your build script in package.json to only build the client:
   ```json
   "scripts": {
     "build:static": "vite build --outDir dist",
     "predeploy": "npm run build:static",
     "deploy": "gh-pages -d dist"
   }
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is [MIT](LICENSE) licensed.

## 📫 Contact

For questions or support, please open an issue in the GitHub repository. 