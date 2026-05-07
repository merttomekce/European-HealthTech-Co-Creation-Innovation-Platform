const DEMO_LOGIN = {
  email: 'demo@healthai.edu',
  password: 'demo1234',
  role: 'ENGINEER',
};

function isDemoLogin(email, password) {
  return email === DEMO_LOGIN.email && password === DEMO_LOGIN.password;
}

module.exports = {
  DEMO_LOGIN,
  isDemoLogin,
};
