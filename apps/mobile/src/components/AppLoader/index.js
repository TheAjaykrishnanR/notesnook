import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import AnimatedProgress from 'react-native-reanimated-progress-bar';
import { useTracked } from '../../provider';
import { useFavoriteStore, useNoteStore } from '../../provider/stores';
import {
  eSendEvent,
  eSubscribeEvent,
  eUnSubscribeEvent
} from '../../services/EventManager';
import { editing } from '../../utils';
import { changeContainerScale, ContainerScale } from '../../utils/Animations';
import { db } from '../../utils/DB';
import { eOpenRateDialog, eOpenSideMenu } from '../../utils/Events';
import { MMKV } from '../../utils/mmkv';
import { tabBarRef } from '../../utils/Refs';
import SplashScreen from '../SplashScreen';

const scaleV = new Animated.Value(0.95);
const opacityV = new Animated.Value(1);
const AppLoader = ({onLoad}) => {
  const [state, dispatch] = useTracked();
  const colors = state.colors;
  const [loading, setLoading] = useState(true);
  const [opacity, setOpacity] = useState(true);
  const setNotes = useNoteStore(state => state.setNotes);
  const setFavorites = useFavoriteStore(state => state.setFavorites);
  const _setLoading = useNoteStore(state => state.setLoading)
  const load = async value => {
    console.log('loading called here');
    if (value === 'hide') {
      setLoading(true);
      opacityV.setValue(1);
      return;
    }
    let appState = await MMKV.getItem('appState');
    if (appState) {
      appState = JSON.parse(appState);
      if (appState.note && !appState.movedAway && Date.now() < appState.timestamp + 3600000) {

        editing.isRestoringState = true;
        //setNoteOnly(appState.note);
        editing.currentlyEditing = true;
        tabBarRef.current?.goToPage(1);
        eSendEvent('loadingNote', appState.note);
      }
    }

    if (value === 'show') {
      opacityV.setValue(0);
      setLoading(false);
      return;
    }

    eSendEvent(eOpenSideMenu);
    setOpacity(false);
    setTimeout(() => {
      Animated.timing(opacityV, {
        toValue: 0,
        duration: 100,
        easing: Easing.out(Easing.ease),
      }).start();
      changeContainerScale(ContainerScale, 1, 600);

      setTimeout(async ()=>{
        setLoading(false);  
        await db.notes.init();
        setNotes();
        setFavorites();
        _setLoading(false);
        eSendEvent(eOpenSideMenu);
        let askForRating = await MMKV.getItem('askForRating');
        if (askForRating !== 'never' || askForRating !== 'completed') {
          askForRating = JSON.parse(askForRating);
          if (askForRating?.timestamp < Date.now()) {
            eSendEvent(eOpenRateDialog);
          }
        }
      },100)
    },0);
  };

  useEffect(() => {
    eSubscribeEvent('load_overlay', load);
    onLoad();
    return () => {
      eUnSubscribeEvent('load_overlay', load);
    };
  }, []);

  return loading ? (
    <Animated.View
      style={{
        backgroundColor: opacity ? colors.bg : 'rgba(0,0,0,0)',
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 999,
        borderRadius: 10,
      }}>
      <Animated.View
        onTouchStart={() => {
          setLoading(false);
        }}
        style={{
          backgroundColor: colors.bg,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          opacity: opacityV,
        }}>
        <View
          style={{
            height: 10,
            flexDirection: 'row',
            width: 100,
          }}>
          <AnimatedProgress fill={colors.accent} current={4} total={4} />
        </View>
      </Animated.View>
    </Animated.View>
  ) : (
    <SplashScreen />
  );
};

export default AppLoader;
