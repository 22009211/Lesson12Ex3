import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { Audio } from 'expo-av';

export default function App() {
    const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
    const [mySound, setMySound] = useState();
    const [subscription, setSubscription] = useState(null);
    const [shakeDetected, setShakeDetected] = useState(false);

    const _slow = () => Magnetometer.setUpdateInterval(100);
    const _fast = () => Magnetometer.setUpdateInterval(16);

    const _subscribe = () => {
        setSubscription(
            Magnetometer.addListener(result => {
                setData(result);
                if (isShake(result)) {
                    console.log('Shake detected');
                    playSound();
                    setShakeDetected(true);
                    setTimeout(() => setShakeDetected(false), 1000); // Hide indicator after 1 second
                }
            })
        );
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    const isShake = (data) => {
        const { x, y, z } = data;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        console.log('Magnitude:', magnitude);
        return magnitude > 1.2; // Adjust the threshold as needed
    };

    async function playSound() {
        try {
            const soundfile = require('./233665__rioforce__lego-shake-3-times.wav');
            const { sound } = await Audio.Sound.createAsync(soundfile);
            setMySound(sound);
            console.log('Playing sound');
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(status => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    useEffect(() => {
        _subscribe();
        return () => {
            _unsubscribe();
            if (mySound) {
                mySound.unloadAsync();
            }
        };
    }, [mySound]);

    return (
        <View style={styles.container}>
            <StatusBar />
            {shakeDetected && <View style={styles.indicator}><Text>Shake Detected!</Text></View>}
            <Button title="Slow Update" onPress={_slow} />
            <Button title="Fast Update" onPress={_fast} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        position: 'absolute',
        top: '50%',
        backgroundColor: 'red',
        padding: 20,
        borderRadius: 10,
    },
});