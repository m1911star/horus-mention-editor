import React, { Component } from 'react';
import { render } from 'react-dom';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from './schema.js';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import { addMentionNodes, addTagNodes, getMentionsPlugin } from './plugin';
import './style.css';
import { Button } from 'antd';

const newNodes = addTagNodes(addMentionNodes(schema.spec.nodes));

const mySchema = new Schema({
  nodes: addListNodes(newNodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks
});
var getMentionSuggestionsHTML = items => '<div class="suggestion-item-list">'
  + items.map(i => '<div class="suggestion-item">' + i.name + '</div>').join('')
+ '</div>';

var getTagSuggestionsHTML = items => '<div class="suggestion-item-list">'
  + items.map(i => '<div class="suggestion-item">' + i.tag + '</div>').join('')
+ '</div>';
var mentionPlugin = getMentionsPlugin({
  delay: 0,
  allowSpace: false,
  getSuggestions: (type, text, done) => {
    setTimeout(() => {
      if (type === 'mention') {
        // pass dummy mention suggestions
        done([{ name: 'John Doe', id: '101', email: 'joe@gmail.com' }, { name: 'Joe Lewis', id: '102', email: 'lewis@gmail.com' }]);
      } else {
        // pass dummy tag suggestions
        done([{ tag: 'WikiLeaks' }, { tag: 'NetNeutrality' }]);
      }
    }, 0);
  },
  getSuggestionsHTML: (items, type) => {
    if (type === 'mention') {
      return getMentionSuggestionsHTML(items);
    } else if (type === 'tag') {
      return getTagSuggestionsHTML(items);
    }
  }
});
const myPlugins = exampleSetup({ schema: mySchema, menuBar: false });
myPlugins.unshift(mentionPlugin);

class App extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React'
    };
  }
  componentDidMount() {
    this.view = new EditorView(this.editor, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(this.content),
        plugins: myPlugins,
        schema: mySchema
      }),
      handlePaste: (view, event, slice) => { console.log(view, event, slice); }
    });
  }

  render() {
    return (
      <div style={{ width: 300, height: 800 }} ref={ r => {
        this.editor = r;
      }}>
        <div ref= {r => {
          this.content = r;
        }}/>
        <Button onClick={()=>{
          window.view = this.view; // DEBUG 用
        }}>
          点击
        </Button>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
