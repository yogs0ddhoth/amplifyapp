import { useState, useEffect } from 'react';

import { API, Storage } from 'aws-amplify';
import { listNotes } from './graphql/queries';
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from './graphql/mutations';

import { 
  Authenticator,
  Button,
  Card,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
} from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";

import "./App.css";

import { SignOut } from '@aws-amplify/ui-react/dist/types/components/Authenticator/Authenticator';
import { GraphQLResult } from '@aws-amplify/api-graphql';

function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData: GraphQLResult<any> = await API.graphql({ query: listNotes });

    const notesFromAPI = apiData.data.listNotes.items;

    await Promise.all(
      notesFromAPI.map(async note => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    )

    return setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    
    const form = new FormData(event.target);

    const image = form.get('image') as File;

    const data = {
      name: form.get('name') as string,
      description: form.get('description'),
      image: image.name,
    };

    if (!!data.image) await Storage.put(data.name, image);

    await API.graphql({ 
      query: createNoteMutation, 
      variables: { input: data } 
    });

    fetchNotes();

    event.target.reset();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter(note => note.id !== id);

    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  } 

  return (
    <Authenticator>
      {
        ({ signOut }: { signOut: SignOut }) => (
          <View className="App">
            <Heading level={1}>We now have Auth!</Heading>
            <View as="form" onSubmit={createNote}>
              <Flex direction="row" justifyContent="center">
                <TextField
                  name="name"
                  placeholder="Note name"
                  label="Note name"
                  labelHidden
                  variation='quiet'
                  required
                />
                <TextField
                  name="description"
                  placeholder="Note description"
                  label="Note description"
                  labelHidden
                  variation='quiet'
                  required
                />
                <View
                  name="image"
                  as="input"
                  type="file"
                  style={{ alignSelf: "end" }}
                />
                <Button type="submit" variation='primary'>
                  Create Note
                </Button>
              </Flex>
            </View>

            <Heading level={2}>My Notes</Heading>

            <View margin="3rem 0">
              {notes.map(note => (
                <Flex
                  key={note.id || note.name}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text as="strong" fontWeight={700}>
                    {note.name}
                  </Text>
                  <Text as="span">{note.description}</Text>
                  {note.image && (
                    <Image
                      src={note.image}
                      alt={`visual aid for ${note.name}`}
                      style={{ width: 400 }}
                    />
                  )}
                  <Button variation='link' onClick={() => deleteNote(note)}>
                    Delete note
                  </Button>
                </Flex>
              ))}
            </View>
            <Button onClick={signOut}>Sign Out</Button>
          </View>
        )
      }
    </Authenticator>
  );
}

export default App;
