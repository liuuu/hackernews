import React, { Component } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/Header';
import LinksList from './components/LinksList';
import CreateLink from './components/CreateLink';
import './App.css';
import Login from './components/Login';
import Search from './components/Search';

// eslint-disable-next-line
class App extends Component {
  render() {
    return (
      <div className="center w85">
        <Header />
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/new/1" />} />
            <Route exact path="/top" component={LinksList} />
            <Route exact path="/create" component={CreateLink} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/search" component={Search} />
            <Route exact path="/new/:page" component={Search} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
