/**
 *  FileName: App.js
 *  Description: The client-side code of our application
 *  Author: MohammadHasan Payandeh <mpu236@uregina.ca>
 *  Version: 1.0
 *  Date-created: March 15, 2022
 *  Last-modified: April 07, 2022
 */

import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, Pressable, Button, Alert, Image } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/**
 * staticScreenOrientation
 * Purpose: This function disables screen rotation.
 * Parameter(s): -
 * Precondition(s): 
 * <1> The expo-screen-orientation library should be imported.
 * Returns: -
 * Side effect(s): -
*/
async function staticScreenOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}
staticScreenOrientation();

// This global variable is used to keep a player's name when they log in. It should be global since we want to use it on different pages.
var playerName="";

/**
 * HomeScreen
 * Purpose: This function returns the JSX codes related to the Home Screen. This is the page where players enter their names and enter the match.
 * Parameter(s):
 * <1> The navigation array that is related to the React Navigation library.
 * Precondition(s): 
 * <1> The React Navigation library should be imported.
 * <2> The navigation array should be passed to this function.
 * <3> The playerName variable should be defined.
 * Returns: The JSX codes related to the Home Screen
 * Side effect(s):
 * <1> The playerName variable may change.
 * <2> The player may be redirected to the Match Screen.
*/
const HomeScreen = ({navigation}) => {
  var loginResult="";
  const [userInputValue, setuserInputValue] = useState("");

  /**
   * loginFunction
   * Purpose: This function sends a request to the server for login purposes and returns the results.
   * Parameter(s): -
   * Precondition(s): 
   * <1> The userInputValue state hook should be defined.
   * <2> The loginResult variable should be defined.
   * <3> The React Navigation library should be imported.
   * <4> The navigation array should be defined.
   * <5> The playerName variable should be defined.
   * Returns: -
   * Side effect(s):
   * <1> The playerName variable may change.
   * <2> The player may be redirected to the Match Screen.
  */
  const loginFunction = () => {
    var formData = new FormData();
    formData.append('key', userInputValue);

    fetch("http://www.webdev.cs.uregina.ca/~mpu236/API.php?action=login", {
        'method': 'POST',
        'headers': {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      }
    )
    .then((response) => response.json())
    .then((res) => {
      loginResult = res.message.split(",");
      if(loginResult[0]=="1")
      {
        playerName=loginResult[2];
        navigation.navigate("Match Page");
      }
      else
      {
        Alert.alert(
          "Error",
          loginResult[1],
          [
            { text: "OK" }
          ]
        );
      }
    });
  }

  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertext}>Multiplayer Egg Clicker</Text>
      </View>
      <View style={styles.body}>
        <TextInput onChangeText={newText => setuserInputValue(newText)} style={styles.textinputs} placeholder="Enter your name"/>
        <Pressable onPress={loginFunction}>
          <View style={styles.buttons}>
            <Text style={styles.buttonstext}>ENTER</Text>
          </View>
        </Pressable>
        <Text style={styles.hintbox}>{'\n'}<Text style={styles.boldfont}>Hint:</Text> If you enter "admin" as the name, you will be able to reset the match.</Text>
      </View>
      <View style={[styles.footer, styles.textcenter]}>
        <Text style={styles.textwhite}>© 2022. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );

}


/**
 * MatchScreen
 * Purpose: This function returns the JSX codes related to the Match Screen.
 * Parameter(s):
 * <1> The navigation array that is related to the React Navigation library
 * Precondition(s): 
 * <1> The React Navigation library should be imported.
 * <2> The navigation array should be passed to this function.
 * <3> The playerName variable should be defined and contains the player name who entered the match in the HomeScreen.
 * Returns: The JSX codes related to the Match Screen.
 * Side effect(s):
 * <1> The playerName variable may change.
 * <2> the player may be redirected to the Home Screen.
*/
const MatchScreen = ({navigation}) => {
  
  const [track_players, setTrack_players] = React.useState('');
  const [track_roundinfo, setTrack_roundinfo] = React.useState('');
  const [clickData, setClickData] = React.useState('');

  /**
   * useEffect
   * Purpose: 
   * <1> When the clickData state hook changes, this part of the code will execute and cause the retrieving match page data from the server.
   * <2> This part of the code will execute and retrieve match page data every 5 seconds.
   * Parameter(s): -
   * Precondition(s): 
   * <1> The clickData state hook should be defined.
   * <2> The track_players state hook should be defined.
   * <3> The track_roundinfo state hook should be defined.
   * <4> The playerName variable should be defined.
   * Returns: -
   * Side effect(s):
   * <1> The track_players state hook may change.
   * <2> The track_roundinfo state hook may change.
   * <3> The playerName variable may change.
   * <4> The player may be redirected to the Home Screen.
  */
  React.useEffect(() => {
        let repeat;
        
        function fetchData() {
          var formData = new FormData();
          formData.append('clickdata', clickData);

          fetch("YOUR_HOST_ADDRESS/API.php?action=retrievematchpage", {
              'method': 'POST',
              'headers': {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
              },
              body: formData
            }
          )
          .then((response) => response.json())
          .then((res) => {
            setTrack_players(res.message.split('*')[0]);
            setTrack_roundinfo(res.message.split('*')[1]);

            if(res.message.split('*')[1]=="matchreseted")
            {
              playerName="";
              navigation.navigate("Home Page");
            }
            else if(res.message.split('*')[1]!="matchwinner")
            {
              setClickData("");
              
              repeat = setTimeout(fetchData, 5000);
            }
          });
        }

        fetchData();

        return () => {
            if (repeat) {
                clearTimeout(repeat);
            }
        }
    }, [clickData]);

    /**
     * resetMatch
     * Purpose: This function sends a request to the server to reset the match data. The user who logged in using the "admin" name can trigger this function.
     * Parameter(s): -
     * Precondition(s): 
     * <1> The playerName variable should be defined.
     * <2> The React Navigation library should be imported.
     * <3> The navigation array should be defined.
     * Returns: -
     * Side effect(s):
     * <1> The playerName variable may change.
     * <2> The player may be redirected to the Home Screen.
    */
    function resetMatch() {
          var formData = new FormData();
          formData.append('clickdata', "");

          fetch("YOUR_HOST_ADDRESS/API.php?action=resetmatch", {
              'method': 'POST',
              'headers': {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
              },
              body: formData
            }
          )
          .then((response) => response.json())
          .then((res) => {

            playerName="";
            navigation.navigate("Home Page");

          });
    }
  

  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertext}>Multiplayer Egg Clicker</Text>
      </View>
      <View style={styles.playernames}>
        {track_players.split(',').map(pn => (
          <View style={pn.split('-')[0]!=playerName ? [styles.playernamebox, {backgroundColor: '#ebebeb'}] : [styles.playernamebox, {backgroundColor: '#e2cabf'}] }><Text>{pn.split('-')[0]}</Text><Text style={styles.playernamebox_score}>{pn.split('-')[1]}</Text></View>
        ))}
      </View>
      
        
          <View style={[styles.eggbox, {display: track_roundinfo.split(',')[0]=="wait" ? 'flex' : 'none'}]}>
            <Text style={styles.eggbox_text}>Round {track_roundinfo.split(',')[2]}
            </Text>
            <Text style={[styles.fontsize14, styles.orangecolor]}>Wait for the egg to appear</Text>
          </View>
          
          <View style={[styles.eggbox, {display: track_roundinfo.split(',')[0]=="egg" ? 'flex' : 'none'}]}>
            <Text style={styles.eggbox_text}>Round {track_roundinfo.split(',')[2]}
              <Text style={[styles.fontsize14, styles.redcolor]}>{'\n'}Click on the egg</Text>
            </Text>
            <Pressable onPress={()=>setClickData(playerName+","+Date.now())} style={{top: Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1), left: Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)}}>
              <Text style={[styles.eggbox_egg]}>🥚</Text>
            </Pressable>
          </View>
            
          <View style={[styles.eggbox, {display: track_roundinfo.split(',')[0]=="waitresult" ? 'flex' : 'none'}]}>
            <Text style={styles.eggbox_text}>Round {track_roundinfo.split(',')[2]}</Text>
            <Text style={[styles.fontsize14, styles.orangecolor]}>Wait for this round's result</Text>
          </View>

          <View style={[styles.eggbox, {display: track_roundinfo.split(',')[0]=="result" ? 'flex' : 'none'}]}>
            <Text style={styles.eggbox_text}>Round {track_roundinfo.split(',')[2]} result: </Text>
            <Text style={[styles.fontsize14, styles.greencolor]}>{track_roundinfo.split(',')[3]} </Text>
          </View>

          <View style={[styles.eggbox, {display: track_roundinfo.split(',')[0]=="matchwinner" ? 'flex' : 'none'}]}>
            <Text style={styles.eggbox_text}></Text>
            <Text style={styles.matchwinner}>
              {(track_players.split(',')[0].split('-')[0]==playerName ? 'Congratulations!\nYou' : track_players.split(',')[0].split('-')[0])} won the match. 
            </Text>
          </View>

          <View style={[styles.eggbox, {display: track_roundinfo.split(',')[0]=="matchwinner"||playerName=="admin" ? 'flex' : 'none'}]}>
            <Text style={styles.eggbox_text}></Text>
              <Pressable onPress={resetMatch}>
                <View style={styles.buttons}>
                  <Text style={styles.buttonstext}>Reset Match</Text>
                </View>
              </Pressable>
          </View>
        
      
      <View style={[styles.footer, styles.textcenter]}>
        <Text style={styles.textwhite}>© 2022. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );
}


const Stack = createNativeStackNavigator();
/**
 * App
 * Purpose: This main function returns the JSX codes related to the React Navigation.
 * Parameter(s): -
 * Precondition(s): 
 * <1> The React Navigation library should be imported.
 * <2> The Stack const should be defined using createNativeStackNavigator function.
 * Returns: The main JSX codes.
 * Side effect(s): -
*/
const App = () => {
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home Page">
        <Stack.Screen name="Home Page" component={HomeScreen}/>
        <Stack.Screen name="Match Page" component={MatchScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const appMainColor = '#dc5116'; // If we change this const, the main color of the UI will change.
/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#999',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#bbb',
    fontFamily: ''
  },
  header: {
    height: 60,
    borderBottomWidth: 7,
    borderBottomColor: '#000',
    backgroundColor: '#f7f7f7',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  headertext: {
    flex: 1,
    color: appMainColor,
    fontSize: 20,
    paddingLeft: 10,
    paddingTop: 11,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  },
  footer: {
    height: 60,
    backgroundColor: '#999',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    alignItems: 'center'
  },
  textwhite: {
    color: '#fff',
  },
  textcenter: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttons: {
    borderRadius: 10,
    backgroundColor: appMainColor,
    paddingTop: 7,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    margin: 10,
    borderColor: '#000',
    borderWidth: 2
  },
  buttonstext: {
    color: '#fff',
    fontSize: 22,
  },
  textinputs: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    paddingTop: 11,
    paddingBottom: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    margin: 10,
    marginBottom: 0,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#ebebeb',
  },
  playernames: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  playernamebox: {
    borderWidth: 2,
    padding: 10,
    flexBasis: '44%',
    margin: 10,
    borderColor: appMainColor,
    borderRadius: 8
  },
  playernamebox_score: {
    position: 'absolute',
    right: 9,
    top: 9,
    fontWeight: 'bold',
    color: appMainColor
  },
  eggbox: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    margin: 10,
    backgroundColor: '#f7f7f7',
  },
  eggbox_text: {
    position: 'absolute',
    top: 5,
    textAlign: 'center',
    fontSize: 22
  },
  eggbox_egg: {
    fontSize: 70,
    top: 0,
    left: 0
  },
  boldfont: {
    fontWeight: 'bold'
  },
  hintbox: {
    marginHorizontal: 10, 
    textAlign: 'center'
  },
  fontsize14:  {
    fontSize: 14
  },
  greencolor: {
    color: "green"
  },
  redcolor: {
    color: "red"
  },
  orangecolor: {
    color: "orange"
  },
  matchwinner: {
    fontSize: 20, 
    color: 'green', 
    textAlign: 'center'
  }
  
});


export default App;

