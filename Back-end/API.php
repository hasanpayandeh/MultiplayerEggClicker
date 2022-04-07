<?php
/**
 *  FileName: API.php
 *  Description: The server-side code of our application
 *  Author: MohammadHasan Payandeh <mpu236@uregina.ca>
 *  Version: 1.0
 *  Date-created: March 15, 2022
 *  Last-modified: April 05, 2022
 */

// Including the PHP functions that we need on this page
include_once("functions.php");

/**
 * API.php?action=login
 * Purpose: Executing server-side operations when a request comes from the client-side (from Home Screen)
 * Parameter(s): -
 * Precondition(s): 
 * <1> The conn object, which contains the object for connecting to the database, should be defined.
 * <2> The sqlnum function should be defined.
 * <3> The sqlread function should be defined.
 * <4> The "players" table in the server-side database should be defined.
 * Returns: The results of the server-side operations in JSON format
 * Side effect(s): 
 * <1> The "players" table data in the server-side database may be changed.
*/
if(isset($_GET["action"])&&$_GET["action"]=="login")
{
    if(isset($_POST['key'])) // error check
    {
        $_POST['key']=strtolower(trim($_POST['key']));

        if($_POST['key']=="")
        {
            $message="0,Please enter a name.";
        }
        elseif ( !preg_match('/^[a-zA-Z0-9_]*$/', $_POST['key']) )
        {
            $message="0,Please just use alphabet and numbers as your name.";
        }
        elseif((sqlnum("players","where name='".$_POST['key']."'")>0)&&($_POST['key']!="admin"))
        {
            $message="0,There is a player with the entered name. You have to choose another name.";
        }
        else
        {
            $result = $conn->prepare("insert into players (name) values ('".$_POST["key"]."')");
            $result->execute();

            $message="1,".(sqlread("players","id","where name='".$_POST["key"]."'")*1).",".$_POST['key'];
        }
    }
    else
    {
        $message="0,Error!";
    }
    
    echo json_encode(array(
    "message" => $message
    ));
}
/**
 * API.php?action=retrievematchpage
 * Purpose: Executing server-side operations when a request comes from the client-side (from Match Screen)
 * Parameter(s): -
 * Precondition(s): 
 * <1> The conn object, which contains the object for connecting to the database, should be defined.
 * <2> The sqlnum function should be defined.
 * <3> The sqlread function should be defined.
 * <4> The "players" table in the server-side database should be defined.
 * <5> The "settings" table in the server-side database should be defined.
 * <6> The "rounds" table in the server-side database should be defined.
 * Returns: the results of the server-side operations in JSON format.
 * Side effect(s): 
 * <1> The "players" table data in the server-side database may be changed.
 * <2> The "settings" table data in the server-side database may be changed.
 * <3> The "rounds" table data in the server-side database may be changed.
*/
elseif(isset($_GET["action"])&&$_GET["action"]=="retrievematchpage")
{
    // This part Returns an appropriate response to the client-side if there are no players.
    if(sqlnum("players","")==0)
    {
        echo json_encode(array(
        "message" => "*matchreseted,0,0,0"
        ));
    }
    // This part would return an appropriate response to the client-side if one of the player's (winner) scores were more than 10.
    elseif(sqlnum("players","where score>=10")!=0)
    {
        $playersstr="";
        $sql=$conn->query("select * from players ORDER BY score DESC, id ASC");   
        while($row = $sql->fetch())
        {
            $playersstr=$playersstr.($playersstr=="" ? '' : ',').$row["name"]."-".$row["score"];
        }
        
        echo json_encode(array(
        "message" => "".$playersstr."*matchwinner,0,0,0"
        ));
    }
    else
    {
        // This part creates row 1 of the settings table if it does not exist.
        if(sqlnum("settings","")==0)
        {
            $result = $conn->prepare("insert into settings (id,lockprocess) values (1,0)");
            $result->execute();
        }
        
        // This part checks if the main process was not locked, this part of the code executes. It will be locked if any other players are executing this part.
        // The main process was described in the README file.
        if(sqlread("settings","lockprocess","where id=1")*1==0)
        {
            $result = $conn->prepare("update settings set lockprocess=1 where id=1");
            $result->execute();

            $str="";

            $playersstr="";
            $sql=$conn->query("select * from players ORDER BY score DESC, id ASC");   
            while($row = $sql->fetch())
            {
                $playersstr=$playersstr.($playersstr=="" ? '' : ',').$row["name"]."-".$row["score"];
            }
            $str=$str.$playersstr;

            if(sqlnum("rounds","")!=0)
            {
                $previousroundid=sqlread("rounds","id","ORDER BY number DESC LIMIT 1")*1;
                $previousroundnumber=sqlread("rounds","number","where id=".$previousroundid."")*1;
            }
            else
            {
                $previousroundid=0;
                $previousroundnumber=0;
            }
            
            if(sqlnum("rounds","")==0)
            {
                $param_roundstatus="wait";
                $param_nextstatushappentimestamp=(time());
                $param_roundnumber=1;
                $param_statusdescription="";
                $result = $conn->prepare("insert into rounds (number,winnername,starttime) values (1,'',".$param_nextstatushappentimestamp.")");
                $result->execute();

                
            }
            else
            {
                if(sqlread("rounds","winnername","where id=".$previousroundid."")!="")
                {
                    if(sqlread("rounds","starttime","where id=".$previousroundid."")*1+30<=(time()))
                    {
                        $param_roundstatus="wait";
                        $param_nextstatushappentimestamp=(time());
                        $param_roundnumber=$previousroundnumber*1+1;
                        $param_statusdescription="";
                        $result = $conn->prepare("insert into rounds (number,winnername,starttime) values (".$param_roundnumber.",'',".$param_nextstatushappentimestamp.")");
                        $result->execute();
                    }
                    elseif(sqlread("rounds","starttime","where id=".$previousroundid."")*1+20<=(time()))
                    {
                        $param_roundstatus="result";
                        $param_nextstatushappentimestamp=sqlread("rounds","starttime","where id=".$previousroundid."")*1;
                        $param_roundnumber=$previousroundnumber*1;
                        if(sqlread("rounds","winnername","where id=".$previousroundid."")!="-")
                        {
                            $param_statusdescription="Winner Name: ".sqlread("rounds","winnername","where id=".$previousroundid."")." (+1)";

                            if(time()>sqlread("settings","lastscoreupdatetime","where id=1")*1+20)
                            {
                                $result = $conn->prepare("update players set score=".(sqlread("players","score","where name='".sqlread("rounds","winnername","where id=".$previousroundid."")."'")*1+1)." where name='".sqlread("rounds","winnername","where id=".$previousroundid."")."'");
                                $result->execute();

                                $result = $conn->prepare("update settings set lastscoreupdatetime=".time()." where id=1");
                                $result->execute();
                            }
                        }
                        else
                        {
                            $param_statusdescription="Winner Name: no one!";
                        }
                        
                    }
                    elseif(sqlread("rounds","starttime","where id=".$previousroundid."")*1+10<=(time()))
                    {
                        $param_roundstatus="waitresult";
                        $param_nextstatushappentimestamp=sqlread("rounds","starttime","where id=".$previousroundid."")*1;
                        $param_roundnumber=$previousroundnumber*1;
                        $param_statusdescription="";
                    }
                }
                else
                {
                    // This part would set the winner if no one clicked.
                    if(sqlread("rounds","starttime","where id=".$previousroundid."")*1+20<=(time())) 
                    {
                        $result = $conn->prepare("update rounds set winnername='-',winnertime=".floor(time())." ORDER BY number DESC LIMIT 1");
                        $result->execute();

                        $param_roundstatus="result";
                        $param_nextstatushappentimestamp=(sqlread("rounds","starttime","where id=".$previousroundid."")*1+20);
                        $param_roundnumber=$previousroundnumber*1;
                        $param_statusdescription="Winner Name: no one!";
                    }
                    elseif(sqlread("rounds","starttime","where id=".$previousroundid."")*1+10<=(time()))
                    {
                        $param_roundstatus="egg";
                        $param_nextstatushappentimestamp=(sqlread("rounds","starttime","where id=".$previousroundid."")*1+10);
                        $param_roundnumber=$previousroundnumber*1;
                        $param_statusdescription="";
                    }
                    else
                    {
                        $param_roundstatus="wait";
                        $param_nextstatushappentimestamp=sqlread("rounds","starttime","where id=".$previousroundid."")*1;
                        $param_roundnumber=$previousroundnumber*1;
                        $param_statusdescription="";
                    }
                    
                }
            }

            // If the "clickdata" parameter from the client-side were not null, this part of the code would execute.
            // This part of the code will execute when a player clicks on the egg.
            if($_POST["clickdata"]!="")
            {      
                $clickdata=explode(",",$_POST["clickdata"]);
                if( sqlnum("rounds","")!=0 && ($clickdata[1]*1<sqlread("rounds","winnertime","ORDER BY number DESC LIMIT 1")*1000||sqlread("rounds","winnertime","ORDER BY number DESC LIMIT 1")*1==0) )
                {
                    $result = $conn->prepare("update rounds set winnername='".$clickdata[0]."',winnertime=".floor($clickdata[1]/1000)." ORDER BY number DESC LIMIT 1");
                    $result->execute();
                }
            }
            
            

            // This part generates a response and prints it in JSON format.
            // Pattern: player1-score1,player2-score2,...*round status(wait, result, egg, waitresult),next status happen timestamp,round number,status description
            $str=$str."*"."".$param_roundstatus.",".$param_nextstatushappentimestamp.",".$param_roundnumber.",".$param_statusdescription;
            
            echo json_encode(array(
                "message" => $str
            ));
        }

        $result = $conn->prepare("update settings set lockprocess=0 where id=1");
        $result->execute();
    }
}
/**
 * API.php?action=resetmatch
 * Purpose: Executing server-side operations when a request come from the client-side for resetting the match data
 * Parameter(s): -
 * Precondition(s): 
 * <1> The conn object, which contains the object for connecting to the database, should be defined.
 * <2> The "players" table in the server-side database should be defined.
 * <3> The "settings" table in the server-side database should be defined.
 * <4> The "rounds" table in the server-side database should be defined.
 * Returns: the results of the server-side operations in JSON format.
 * Side effect(s): 
 * <1> The "players" table data in the server-side database may be changed.
 * <2> The "settings" table data in the server-side database may be changed.
 * <3> The "rounds" table data in the server-side database may be changed.
*/
elseif(isset($_GET["action"])&&$_GET["action"]=="resetmatch")
{
    $result = $conn->prepare("delete from players");
    $result->execute();

    $result = $conn->prepare("delete from rounds");
    $result->execute();

    $result = $conn->prepare("delete from settings");
    $result->execute();

    echo json_encode(array(
    "message" => ""
    ));
}
else
{
    echo json_encode(array(
    "message" => "0"
    ));
}

$conn=null;

?>
