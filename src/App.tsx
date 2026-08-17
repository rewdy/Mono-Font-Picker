import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Home } from "./pages/Home";
import { FontView } from "./pages/FontView";
import { Compare } from "./pages/Compare";

function App() {
  // Hash-based routing avoids static-server 404s on deep links/reloads in the
  // Tauri webview (e.g. reloading on /font/... or /compare).
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/font/:family" component={FontView} />
        <Route path="/compare" component={Compare} />
        <Route>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
