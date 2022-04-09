<?php
/**
 *  FileName: functions.php
 *  Description: The functions that we used in the main server-side code of our application.
 *  Author: MohammadHasan Payandeh <mpu236@uregina.ca>
 *  Version: 1.0
 *  Date-created: March 15, 2022
 *  Last-modified: April 05, 2022
 */

 /**
 * dbconnect
 * Purpose: connecting to the database
 * Parameter(s): 
 * <1> servername
 * <2> database user username
 * <3> database user password
 * <4> database name
 * Precondition(s): -
 * Returns: the connection object
 * Side effect(s): -
*/
function dbconnect($servername,$username,$password,$dbname)
{
  try {
      $conn = new PDO("mysql:host=$servername;dbname=$dbname;charser=utf8mb4", $username, $password);
      // set the PDO error mode to exception
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
      $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);    
      return $conn;
  } catch(PDOException $e) {
      return "Connection failed: " . $e->getMessage();
  }
  
}
$conn=dbconnect("localhost","YOUR_DATABASE_NAME","YOUR_DATABASE_USERNAME","YOUR_DATABASE_PASSWORD");

/**
 * sqlread
 * Purpose: reading a column of a row of a table
 * Parameter(s): 
 * <1> tablename
 * <2> name of the column
 * <3> query condition
 * Precondition(s):
 * <1> The conn object, which contains the object for connecting to the database, should be defined.
 * Returns: the value of the column
 * Side effect(s): -
*/
function sqlread($tablename,$columnname,$cond="")
{
    global $conn;
    $result = $conn->prepare("select * from $tablename $cond");
    $result2 = $conn->query("select * from $tablename $cond");
    if($result2->rowCount()==0)
    {
        return ("");
    }
    else
    {
        $result->execute();
        $row = $result->fetch();
        return ($row[$columnname]);
    }
}

/**
 * sqlread
 * Purpose: counting the rows of a table with a specific condition
 * Parameter(s): 
 * <1> tablename
 * <2> query condition
 * Precondition(s):
 * <1> The conn object, which contains the object for connecting to the database, should be defined.
 * Returns: the rows number of the results
 * Side effect(s): -
*/
function sqlnum($tablename,$cond="")
{
    global $conn;
    $result = $conn->query("select * from $tablename $cond");
    return ($result->rowCount());
}


?>