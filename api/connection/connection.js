import mysql from 'mysql2'

const connection = mysql.createConnection({
  host: 'localhost',        
  user: 'root',            
  password: 'samo123', 
  database: '10_decTest'  
});


connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL ');
});

export default connection;