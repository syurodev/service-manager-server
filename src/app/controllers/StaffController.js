class StaffController {
  // [GET] /staff/login
  login(req, res) {
    res.json("Login!!");
  }
}

module.exports = new StaffController();
