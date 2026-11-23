import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

// NativeWind className'i yalnızca React Native'in kendi bileşenlerinde tanır;
// başka paketlerden gelenler burada tanıtılır.
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(KeyboardAwareScrollView, { className: 'style', contentContainerClassName: 'contentContainerStyle' });
