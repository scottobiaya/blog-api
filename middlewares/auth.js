const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {

  try{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // if (token == null) return res.status(401).json({message: 'Unauthorized'})

    if (token){
      jwt.verify(token, process.env.SECRET_KEY , (err, user) => {
        
        if (err && err.message == 'jwt expired') {
          return res.status(401).json({message: 'Token expired, please login again'})
        }
        
        if (err) return res.status(403).json({message: 'An Error occured! please contact admin'})
    
        
        req.user = user

        next()
      })
    }else{
      next()
    }
  } catch(err){
    console.log('e')
    console.log(err);
  }
  
}

module.exports = authenticateToken