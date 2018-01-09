import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

class Header extends Component {
  render() {
    const userId = localStorage.getItem('GC_USER_ID');
    return (
      <div className="flex pa1 justify-between nowrap orange">
        <div className="flex flex-fixed black">
          <div className="fw7 mr1">Hacker News</div>
          <Link to="/" className="ml1 no-underline black">
            new
          </Link>
          {userId && (
            <div className="flex">
              <div className="ml1">|</div>
              <Link to="/create" className="ml1 no-underline black">
                submit
              </Link>
            </div>
          )}
          <div className="flex">
            <div className="ml1">|</div>
            <Link to="/search" className="ml1 no-underline black">
              search
            </Link>
            <Link to="/top" className="ml1 no-underline black">
              top
            </Link>
            <div className="ml1">|</div>
          </div>
        </div>
        <div className="ml1">|</div>

        <div className="flex flex-fixed">
          {userId ? (
            <div
              className="ml1 pointer black"
              onClick={() => {
                localStorage.removeItem('GC_USER_ID');
                localStorage.removeItem('GC_AUTH_TOKEN');
                this.props.history.push('/new/1');
              }}
            >
              logout
            </div>
          ) : (
            <Link to="/login" className="ml1 no-underline black">
              login
            </Link>
          )}
        </div>
      </div>
    );
  }
}

export default Header;