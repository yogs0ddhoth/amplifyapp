import React from 'react';
import logo from './logo.svg';

import { 
  Authenticator,
  Button,
  Heading,
  Image,
  View,
  Card,
} from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";

import { SignOut } from '@aws-amplify/ui-react/dist/types/components/Authenticator/Authenticator';

function App() {
  return (
    <Authenticator>
      {
        ({ signOut }: { signOut: SignOut }) => (
          <View className="App">
            <Card>
              <Image src={logo} className="App-logo" alt="logo" />
              <Heading level={1}>We now have Auth!</Heading>
              <Button onClick={signOut}>Sign Out</Button>
            </Card>
          </View>
        )
      }
    </Authenticator>
  );
}

export default App;
