import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/tv">
          <Tv />
        </Route>
        <Route path="/search">
          <Search />
        </Route>
        <Route 
        // 유저가 / 에 있을 때도 home을 렌더하고
        // /movies/:movieId에 있을 때도 home을 렌더함
        //그러니까 home이라는 배경은 항상 바닥에 깔려있고
        //위에 movie만 겹쳐서 뜨는 모양새가 되도록 해주는 것
          path={["/", "/movies/:movieId"]}>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;