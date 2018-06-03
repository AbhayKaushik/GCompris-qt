/* GCompris - ActivityInfo.qml
 *
 * Copyright (C) 2016 Johnny Jazeix <jazeix@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */
import GCompris 1.0

ActivityInfo {
  name: "piano_composition/Piano_composition.qml"
  difficulty: 2
  icon: "piano_composition/piano_composition.svg"
  author: "Johnny Jazeix &lt;jazeix@gmail.com&gt;"
  demo: true
  title: qsTr("Piano Composition!")
  description: qsTr("An activity to learn how the piano keyboard works, how notes are written on a musical staff and explore music composition by loading and saving your work.")
  goal: qsTr("Develop an understanding of music composition, and increase interest in making music with a piano keyboard. This activity covers many fundamental aspects of music, but there is much more to explore about music composition. If you enjoy this activity but want a more advanced tool, try downloading MuseScore (http://musescore.org/en/download), an open source music notation tool.")
  prerequisite: qsTr("Familiarity with note naming conventions, note-names activity useful to learn this notation.")
  manual: qsTr("This activity has several levels, each level adds a new functionality to the previous level. 
  Level 1: Basic piano keyboard (white keys only) and students can experiment with clicking the colored rectangle keys to write music.
  Level 2: The musical staff switches to bass clef, so pitches are lower than in previous level.
  Level 3: Option to choose between treble and bass clef, addition of black keys (sharp keys).
  Level 4: Flat notation used for black keys.
  Level 5: Option to select note duration (whole, half, quarter, eighth notes).
  Level 6: Addition of rests (whole, half, quarter, eighth rests)
  Level 7: Load children's melodies from around the world and also save your composition.

The following keyboard bindings work in this game:
- backspace: erase attempt
- delete: erase attempt
- enter/return: OK button
- space bar: play
- number keys:
  - 1: C
  - 2: D
  - 3: E
  - 4: F
  - 5: G
  - 6: A
  - 7: B
  - 8: C (higher octave)
  - etc.
  - F1: C# / Db
  - F2: D# / Eb
  - F3: F# / Gb
  - F4: G# / Ab
  - F5: A# / Bb
")
  credit: ""
  section: "discovery sound_group"
}
