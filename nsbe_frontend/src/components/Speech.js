import React, { useState, useContext, useEffect } from 'react';
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import ScrollToBottom from 'react-scroll-to-bottom';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from './Context';
import Navbar from './Navbar';
import "./Speech.css";
import MicIcon from './img/mic.png'
// import CameraIcon from './img/camera_button.png'
import { Component } from "react"
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react'
import Maps from './Maps';
import Modal from './Modal';


function Speech() {
    function help(value) {
        if ('help' in value.toLowerCase()) {
            const res = fetch('http://127.0.0.1:5000/report/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "prompt": 'Urgent Request for Help' })})
                .then(response => response.json())
            return res
        }

    }
    const [value, setValue] = useState('');
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result) => {
            const res = help(result);
            setValue(result);
            //   console.log(result);
        },
    });
    const [messageList, setMessageList] = useState([]);
    const [UserOrAI, setUserOrAI] = useState('user'); // whether or not this is robot OR USER
    const [countStop, setCountStop] = useState(0);
    const { reportPhrase, setReportPhrase, resp, setResp, photoTaken, setPhotoTaken } = useContext(AppContext);
    const navigate = useNavigate();
    const { speak } = useSpeechSynthesis();
    const [show, setShow] = useState(false);
    {/* location: { lat: 43.664486, lng: -79.399689 }, */}

    const [sampleResponse, setSampleResponse] = useState({
        'response': [
            [
                0,
                "43",
                "-78",
                "I was shoved by a police officer",
                "04/03/2023 16:35",
            ],
            [
                1, 
                "44",
                "-79",
                "I was physically assaulted by a police officer",
                "04/020/2023 19:40",
            ],
            [
                2, 
                "45",
                "-80",
                "I was physically assaulted r",
                "04/030/2023 19:50",
            ]
        ]
    });

    useEffect(() => {
        if (photoTaken) {
            setPhotoTaken(false);
            sendMessage('We identified the technology', 'ai');
        }
    }, []);

    const sendMessage = async (messageValue, user_author) => {
        // if (currentMessage !== "") {
        const messageData = {
            author: user_author, // whether or not this is robot OR USER
            message: messageValue,
            time:
                new Date(Date.now()).getHours() +
                ":" +
                new Date(Date.now()).getMinutes(),
        };

        //   await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
        //clear my message console after the message is sent
        //   setCurrentMessage("");
        // }
    };

    
    // send the user's speech (converted to text) to the backend
    const postSpeech = async () => {
        try {
            const body = { "transcript": value }; // convert to JSON since body needs to be in JSON format
            // const responses = [];
            const response = await fetch('http://127.0.0.1:5000/analyze/', {
                method: "POST",
                // mode: 'no-cors',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": '*',
                    "Access-Control-Allow-Headers": '*',
                    "Access-Control-Allow-Methods": 'GET, POST, PUT, DELETE'
                },
                body: JSON.stringify(body)
            });
            // console.log(await response.json())
            let resp = "";
            await response.json().then((data) => {
                console.log(data)
                resp = data.response;
            })
            // console.log(resp)
            // responses.push(resp);
            // sendMessage(resp, 'ai');
            // speak({ text: resp })
            // console.log(responses[countStop]);
            // setCountStop(countStop + 1);
            // setUserOrAI('ai');
            // setValue('asdasdasdasd');
            // sendMessage(responses[countStop], 'ai');
            // speak({ text: responses[countStop] })
            // sendMessage(response);
            // console.log(responses[countStop]);
            setValue('');
            // return response.response;


        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="chat-window">
                {/* footer */}
                <div className="chat-body">

                    <Maps markerInfos={sampleResponse.response}/>
                </div>

                <div className="chat-footer">
                    <button
                        className='send-button'
                        onClick={() => {
                            stop();
                            setUserOrAI('user');
                            sendMessage(value, 'user');
                            postSpeech().then((reply) => {
                                console.log("wow")
                            });
                            console.log('this should be empty:', value)
                        }} > Send </button>
                    <button onClick={listen} className='send-button'>
                    Record </button>
                    <button className='send-button'
                        onClick={() => setShow(true)}>Report</button>
                    <Modal onClose={() => setShow(false)} show={show}>
                        <p>This is modal body</p>
                    </Modal>

                    {listening}
                </div>


            </div>
        </>

    );
}

export default Speech;