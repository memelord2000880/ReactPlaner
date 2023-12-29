
/*
 * EHughes
 * 
 * Following proccesses:
 * Check login
 * Check user in DB
 * Create user in DB
 * Pass ID to rest of project
 * 
 */

import React from 'react';
import Head from './Header/HeadMain.js';//HeadMain.js is the next file to be called
import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';//Google authentication
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyAYGEZ3ZAIu0w4tVthOvOu5YoAr2YZ-Pao",
    authDomain: "planner-cffb8.firebaseapp.com",
    projectId: "planner-cffb8",
    storageBucket: "planner-cffb8.appspot.com",
    messagingSenderId: "482765229023",
    appId: "1:482765229023:web:dc47d16e7dd5a32a1f526a",
    measurementId: "G-X0E8EZWHLE"
};//firebase credentials. May want to hide later

const app = initializeApp(firebaseConfig);//get connection to app
const db = getFirestore(app);//connect to DB
const idRef = collection(db, "ID");//find collection
const jose = require('jose');//used to decode google response

export default function App() {//called from index.js
   //#region Login
    const [userID, setID] = useState(null);//represents user local id
    
    if (sessionStorage.getItem("CurrentUserID") != null && userID==null) {//if there is an id stored
        setID(parseInt(sessionStorage.getItem("CurrentUserID")));//assign it
    }
    
    const [loggedIn, setLogin] = useState(false);//bool for showing if the user is logged in
    if (userID != null && !loggedIn) {//if there is an id and not logged in

        setLogin(true);// logged in

    }
    if (!loggedIn) {//if the user is not logged in
        //render google login page
        const LoggedIn = (GoogleCredentials) => {//called from onSuccess GoogleLogin to validate login

           const DecodedGoogleCredentials = jose.decodeJwt(GoogleCredentials.credential);//decode google response
            window.sessionStorage.setItem("CurrentProfilePhoto", DecodedGoogleCredentials.picture);//get the url for the user's google photo

            Login(DecodedGoogleCredentials.sub).then((localID)=> {//Login returns a promise with the local id for the database

                sessionStorage.setItem("CurrentUserID", localID);//set for refresh

                setID(localID);//set to recall App
                setLogin(true);//set to ensure it will be recalled

            });//end of Login().then(()=>{});

        };//end of LoggedIn


        const errorMessage = (error) => {//called from onError GoogleLogin to debug an error
            console.log(error);//debug error
        };//end of errorMessage = () => {}

        return (
            <div>
                <center>
                    <h2>Welcome to STEM Tempest</h2>
         
                    <br/>
                    <br/>
                      <GoogleLogin onSuccess={LoggedIn} onError={errorMessage} />
                </center>
            </div>
        )
          //#endregion

    } else {//if user is logged in
        //display rest of planner
        return (
            <>        
            <Head IDPass={userID} /> 
            </>
        );
    }
    

}



async function Login(GoogleID) {//Called from App()
    
    const idQuery = query(idRef, where("id", "==", GoogleID.toString()));//build query for user's id
    const idDoc = await getDocs(idQuery);//get doc found in query. There should only be one

    var foundDoc;
    idDoc.forEach((doc) => {//loop through docs
       foundDoc = doc//get the doc 
    });
    if (foundDoc != null) {//if there is a doc
        
        return foundDoc.data().localID;//return the id
    }
   else {//create new user if user is not found
        
       return CreateUser(GoogleID);//create the login
    }
}//end of Login(id)


async function CreateUser(GoogleID) {//this function creates a new user of none was existed: Called from Login(id)
    
    
    const idDoc = await getDoc(doc(idRef, "High"));//get document containing the highest id

    const HighestID = idDoc.data().HighestID;//get the highest ID

    const EmptyArray = [];//empt array used as a place holder

    await setDoc(doc(idRef, HighestID.toString()), {//create a new doc for user

        id: GoogleID.toString(),//match google id
        localID: HighestID,//to local id
        EventArray: EmptyArray //creates an empty array that will hold all events
    });//end of setDoc

    setDoc(doc(idRef, "High"), {//incremen highest id by one

        HighestID: HighestID + 1
    });
    
    return HighestID;
}//end of CreateUser(id)