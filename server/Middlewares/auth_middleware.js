/* eslint-disable */
const jwt = require("jsonwebtoken");

const auth_middleware = {
  authenticated: (req, res, next) => {

    if (req.cookies.currentUser) {
      const user = jwt.verify(req.cookies.currentUser, process.env.JWT_SECRET);

      if (user) next();

      else res.redirect('/login');
    }

    else res.redirect('/login');
  },
  notAuthenticated: (req, res, next) => {
    if (!req.cookies.currentUser) next();

    else if (req.cookies.currentUser) {
      const user = jwt.verify(req.cookies.currentUser, process.env.JWT_SECRET);
      
      if (!user) next();
      
      else res.redirect('/');
    }

    else res.redirect('/')
  }
}

module.exports = auth_middleware
