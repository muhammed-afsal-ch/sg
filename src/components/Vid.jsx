import * as React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {useEffect, useState} from "react";

export default function Vid() {
    const video = React.useRef(null);
    const playerButton = React.useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [status, setStatus] = React.useState({});
    const styles = StyleSheet.create({
        container: {
            alignItems:"center",
            justifyContent: "center",
            height: "100%",
            width:"100%"
        },
        video: {
            height: "380px",
            width: "400px"
        },
        buttons: {
            display:"flex",
            width: "500px",
            flexDirection: "row",
            padding:0,
            margin:0,
            justifyContent: "flex-start",
            marginLeft:"200px"
        },
        spacing: {
          marginRight: "16px",
        }
    });

    useEffect(()=> {

    },[])

    return (
        <View style={styles.container}>
            <Video
                ref={video}
                style={styles.video}
                source={{
                    uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                }}
                autoPlay
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                isMuted={isMuted}
                onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
            <View style={styles.buttons}>
                <Button
                    style={styles.button}
                    ref={playerButton}
                    title={status.isPlaying ? 'Pause' : 'Play'}
                    onPress={() =>
                        status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
                    }
                />
                
                <Button
                    style={styles.button}
                    ref={playerButton}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    onPress={() => setIsMuted(!isMuted)}
                />
            </View>
        </View>
    );
}