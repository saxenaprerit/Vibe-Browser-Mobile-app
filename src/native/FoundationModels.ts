import {NativeModules} from 'react-native';

// Placeholder bridge for Apple Foundation Models (iOS 26+).
// The native side will be implemented in ios/FoundationModels/ as an RCTBridgeModule.
const {FoundationModels} = NativeModules;

export default FoundationModels;
