import connection from "../connection/connection.js";
const ensureVerified = (req, res, next) => {
    const { email } = req.body;
  console.log(email)
    const query = 'SELECT verified FROM usersDetail WHERE email = ?';
    connection.query(query, [email], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }
  
      if (result.length === 0 || !result[0].verified) {
          
        return res.status(403).send('Email not verified');
      }
      console.log("verified user---------------")
      next();
    });
  };
  
  export default ensureVerified