/* GCompris - digital_electricity.js
 *
 * Copyright (C) 2016 Pulkit Gupta <pulkitnsit@gmail.com>
 *
 * Authors:
 *   Bruno Coudoin <bruno.coudoin@gcompris.net> (GTK+ version)
 *   Pulkit Gupta <pulkitnsit@gmail.com> (Qt Quick port)
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, see <http://www.gnu.org/licenses/>.
 */
.pragma library
.import QtQuick 2.3 as Quick

var currentLevel = 1
var numberOfLevel
var items
var url = "qrc:/gcompris/src/activities/digital_electricity/resource/"
var toolDelete
var toolDeleteSticky
var selectedIndex
var animationInProgress
var selectedTerminal
var deletedIndex = []
var components = []
var connected = []
var determiningComponents = []

function start(items_) {

    items = items_
    currentLevel = 1
    numberOfLevel = items.tutorialDataset.tutorialLevels.length
    initLevel()
}

function stop() {

    for(var i = 0 ; i < components.length ; ++i) {
        var j
        for(j = 0 ; j < deletedIndex.length ; ++j) {
            if(deletedIndex[j] == i)
                break
        }
        if(j == deletedIndex.length)
            removeComponent(i)
    }
}

function initLevel() {

    items.bar.level = currentLevel
    var sizeMultiplier = 1 + (1 / (1.5 * currentLevel))

    items.availablePieces.view.currentDisplayedGroup = 0
    items.availablePieces.view.previousNavigation = 1
    items.availablePieces.view.nextNavigation = 1
    deletedIndex = []
    components = []
    connected = []
    determiningComponents = []
    animationInProgress = false
    toolDelete = false
    toolDeleteSticky = false
    deselect()
    updateToolTip("")

    if (!items.isTutorialMode) {
        items.tutorialInstruction.visible = false
        loadFreeMode(sizeMultiplier)
    } else {
        // load tutorial levels from dataset
        var levelProperties = items.tutorialDataset.tutorialLevels[currentLevel - 1]

        for (var i = 0; i < levelProperties.inputComponentList.length; i++) {
            var currentInputComponent = levelProperties.inputComponentList[i]
            items.availablePieces.model.append( {
               "imgName": currentInputComponent.imageName,
               "componentSrc": currentInputComponent.componentSource,
               "imgWidth": currentInputComponent.width * sizeMultiplier,
               "imgHeight": currentInputComponent.height * sizeMultiplier,
               "toolTipText": currentInputComponent.toolTipText
            })
        }

        for (var i = 0; i < levelProperties.playAreaComponentList.length; i++) {
            var index = components.length
            var currentPlayAreaComponent = levelProperties.playAreaComponentList[i]
            var staticElectricalComponent = Qt.createComponent("qrc:/gcompris/src/activities/digital_electricity/components/" + currentPlayAreaComponent.componentSource)
            components[index] = staticElectricalComponent.createObject(
                        items.playArea, {
                          "index": index,
                          "posX": levelProperties.playAreaComponentPositionX[i],
                          "posY": levelProperties.playAreaComponentPositionY[i],
                          "imgSrc": currentPlayAreaComponent.imageName,
                          "toolTipTxt": currentPlayAreaComponent.toolTipText,
                          "imgWidth": currentPlayAreaComponent.width,
                          "imgHeight": currentPlayAreaComponent.height,
                          "destructible": false
                        });
        }

        var _determiningComponentsIndex = levelProperties.determiningComponentsIndex
        for (var i = 0; i < _determiningComponentsIndex.length; i++) {
            determiningComponents[determiningComponents.length] = components[_determiningComponentsIndex[i]]
        }

        // creating wires
        for (i = 0; i < levelProperties.wires.length; i++) {
            var terminal_number = levelProperties.wires[i][1]
            var outTerminal = components[levelProperties.wires[i][0]].outputTerminals.itemAt(terminal_number)

            terminal_number = levelProperties.wires[i][3]
            var inTerminal = components[levelProperties.wires[i][2]].inputTerminals.itemAt(terminal_number)

            createWire(inTerminal, outTerminal, false)
        }

        if (levelProperties.introMessage.length != 0) {
            items.tutorialInstruction.visible = true
            items.tutorialInstruction.index = 0
            items.tutorialInstruction.intro = levelProperties.introMessage
        } else {
            items.tutorialInstruction.visible = false
        }
    }
}

function loadFreeMode(sizeMultiplier) {
    items.availablePieces.model.append( {
        "imgName": "zero.svg",
        "componentSrc": "Zero.qml",
        "imgWidth": sizeMultiplier * 0.12,
        "imgHeight": sizeMultiplier * 0.2,
        "toolTipText": qsTr("Zero input")
    })
    items.availablePieces.model.append( {
        "imgName": "one.svg",
        "componentSrc": "One.qml",
        "imgWidth": sizeMultiplier * 0.12,
        "imgHeight": sizeMultiplier * 0.2,
        "toolTipText": qsTr("One input")
    })
    items.availablePieces.model.append( {
        "imgName": "DigitalLightOff.svg",
        "componentSrc": "DigitalLight.qml",
        "imgWidth": sizeMultiplier * 0.12,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("Digital Light")
    })
    items.availablePieces.model.append( {
        "imgName": "gateAnd.svg",
        "componentSrc": "AndGate.qml",
        "imgWidth": sizeMultiplier * 0.15,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("AND gate")
    })
    items.availablePieces.model.append( {
        "imgName": "gateNand.svg",
        "componentSrc": "NandGate.qml",
        "imgWidth": sizeMultiplier * 0.15,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("NAND gate")
    })
    items.availablePieces.model.append( {
        "imgName": "gateNor.svg",
        "componentSrc": "NorGate.qml",
        "imgWidth": sizeMultiplier * 0.15,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("NOR gate")
    })
    items.availablePieces.model.append( {
        "imgName": "gateNot.svg",
        "componentSrc": "NotGate.qml",
        "imgWidth": sizeMultiplier * 0.15,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("NOT gate")
    })
    items.availablePieces.model.append( {
        "imgName": "gateOr.svg",
        "componentSrc": "OrGate.qml",
        "imgWidth": sizeMultiplier * 0.15,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("OR gate")
    })
    items.availablePieces.model.append( {
        "imgName": "gateXor.svg",
        "componentSrc": "XorGate.qml",
        "imgWidth": sizeMultiplier * 0.15,
        "imgHeight": sizeMultiplier * 0.12,
        "toolTipText": qsTr("XOR gate")
    })
    items.availablePieces.model.append( {
        "imgName": "comparator.svg",
        "componentSrc": "Comparator.qml",
        "imgWidth": sizeMultiplier * 0.3,
        "imgHeight": sizeMultiplier * 0.25,
        "toolTipText": qsTr("Comparator")
    })
    items.availablePieces.model.append( {
        "imgName": "BCDTo7Segment.svg",
        "componentSrc": "BCDToSevenSegment.qml",
        "imgWidth": sizeMultiplier * 0.3,
        "imgHeight": sizeMultiplier * 0.4,
        "toolTipText": qsTr("BCD To 7 Segment")
    })
    items.availablePieces.model.append( {
        "imgName": "sevenSegmentDisplay.svgz",
        "componentSrc": "SevenSegment.qml",
        "imgWidth": sizeMultiplier * 0.18,
        "imgHeight": sizeMultiplier * 0.4,
        "toolTipText": qsTr("7 Segment Display")
    })
    items.availablePieces.model.append( {
        "imgName": "switchOff.svg",
        "componentSrc": "Switch.qml",
        "imgWidth": sizeMultiplier * 0.18,
        "imgHeight": sizeMultiplier * 0.15,
        "toolTipText": qsTr("Switch")
    })
    items.availablePieces.model.append( {
        "imgName": "signalGenerator.svg",
        "componentSrc": "SignalGenerator.qml",
        "imgWidth": sizeMultiplier * 0.25,
        "imgHeight": sizeMultiplier * 0.18,
        "toolTipText": qsTr("Signal Generator")
    })
    items.availablePieces.model.append( {
        "imgName": "bcdCounter.svg",
        "componentSrc": "BcdCounter.qml",
        "imgWidth": sizeMultiplier * 0.3,
        "imgHeight": sizeMultiplier * 0.4,
        "toolTipText": qsTr("BCD Counter")
    })
}

function isTutorialMode() {
    return items.isTutorialMode
}

function checkAnswer() {
    if (currentLevel == 6) {
        var digitalLight = determiningComponents[determiningComponents.length - 1]
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"

                updateComponent(switch1.index)
                updateComponent(switch2.index)

                var operationResult = A ^ B

                if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                    switch1.imgSrc = switch1InitialState
                    switch2.imgSrc = switch2InitialState
                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    items.bonus.bad('tux')
                    return
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 8) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]
        var switch3 = determiningComponents[2]

        var digitalLight = determiningComponents[3]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc
        var switch3InitialState = switch3.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                for (var C = 0; C <= 1; C++) {
                    switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                    switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"
                    switch3.imgSrc = C == 1 ? "switchOn.svg" : "switchOff.svg"

                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    updateComponent(switch3.index)

                    var operationResult = A | (B & C)

                    if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                        switch1.imgSrc = switch1InitialState
                        switch2.imgSrc = switch2InitialState
                        switch3.imgSrc = switch3InitialState
                        updateComponent(switch1.index)
                        updateComponent(switch2.index)
                        updateComponent(switch3.index)
                        items.bonus.bad('tux')
                        return
                    }
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 10) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]
        var switch3 = determiningComponents[2]

        var digitalLight = determiningComponents[3]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc
        var switch3InitialState = switch3.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                for (var C = 0; C <= 1; C++) {
                    switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                    switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"
                    switch3.imgSrc = C == 1 ? "switchOn.svg" : "switchOff.svg"

                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    updateComponent(switch3.index)

                    var operationResult = A ^ (B ^ C)

                    if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                        switch1.imgSrc = switch1InitialState
                        switch2.imgSrc = switch2InitialState
                        switch3.imgSrc = switch3InitialState
                        updateComponent(switch1.index)
                        updateComponent(switch2.index)
                        updateComponent(switch3.index)
                        items.bonus.bad('tux')
                        return
                    }
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 12 || currentLevel == 16) {
        var switch1 = determiningComponents[0]

        var digitalLight = determiningComponents[1]

        var switch1InitialState = switch1.imgSrc

        for (var A = 0; A <= 1; A++) {
            switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"

            updateComponent(switch1.index)

            var operationResult = !A

            if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                switch1.imgSrc = switch1InitialState
                updateComponent(switch1.index)
                items.bonus.bad('tux')
                return
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 13 || currentLevel == 17) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]

        var digitalLight = determiningComponents[2]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"

                updateComponent(switch1.index)
                updateComponent(switch2.index)

                var operationResult = A & B

                if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                    switch1.imgSrc = switch1InitialState
                    switch2.imgSrc = switch2InitialState
                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    items.bonus.bad('tux')
                    return
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 14 || currentLevel == 18) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]

        var digitalLight = determiningComponents[2]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"

                updateComponent(switch1.index)
                updateComponent(switch2.index)

                var operationResult = A | B

                if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                    switch1.imgSrc = switch1InitialState
                    switch2.imgSrc = switch2InitialState
                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    items.bonus.bad('tux')
                    return
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 15) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]

        var digitalLight = determiningComponents[2]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"

                updateComponent(switch1.index)
                updateComponent(switch2.index)

                var operationResult = !(A | B)

                if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                    switch1.imgSrc = switch1InitialState
                    switch2.imgSrc = switch2InitialState
                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    items.bonus.bad('tux')
                    return
                }
            }
        }
        items.bonus.good('tux')
    }  else if (currentLevel == 19) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]

        var digitalLight = determiningComponents[2]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"

                updateComponent(switch1.index)
                updateComponent(switch2.index)

                var operationResult = !(A & B)

                if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                    switch1.imgSrc = switch1InitialState
                    switch2.imgSrc = switch2InitialState
                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    items.bonus.bad('tux')
                    return
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 20) {
        var switch1 = determiningComponents[0]
        var switch2 = determiningComponents[1]

        var digitalLight = determiningComponents[2]

        var switch1InitialState = switch1.imgSrc
        var switch2InitialState = switch2.imgSrc

        for (var A = 0; A <= 1; A++) {
            for (var B = 0; B <= 1; B++) {
                switch1.imgSrc = A == 1 ? "switchOn.svg" : "switchOff.svg"
                switch2.imgSrc = B == 1 ? "switchOn.svg" : "switchOff.svg"

                updateComponent(switch1.index)
                updateComponent(switch2.index)

                var operationResult = A <= B

                if (operationResult != digitalLight.inputTerminals.itemAt(0).value) {
                    switch1.imgSrc = switch1InitialState
                    switch2.imgSrc = switch2InitialState
                    updateComponent(switch1.index)
                    updateComponent(switch2.index)
                    items.bonus.bad('tux')
                    return
                }
            }
        }
        items.bonus.good('tux')
    } else if (currentLevel == 21) {
        var bcdToSevenSegment = determiningComponents[0]

        var decimalValue =
                bcdToSevenSegment.inputTerminals.itemAt(3).value +
                (bcdToSevenSegment.inputTerminals.itemAt(2).value * 2) +
                (bcdToSevenSegment.inputTerminals.itemAt(1).value * 4) +
                (bcdToSevenSegment.inputTerminals.itemAt(0).value * 8)

        if (decimalValue == 6) {
            items.bonus.good('tux')
            return
        }
        items.bonus.bad('tux')
    } else if (currentLevel == 22) {
        var bcdCounter = determiningComponents[0]

        var bcdOutput =
                bcdCounter.outputTerminals.itemAt(3).value +
                bcdCounter.outputTerminals.itemAt(2).value * 2 +
                bcdCounter.outputTerminals.itemAt(1).value * 4 +
                bcdCounter.outputTerminals.itemAt(0).value * 8

        var digitalLightOutput =
                determiningComponents[4].inputTerminals.itemAt(0).value +
                determiningComponents[3].inputTerminals.itemAt(0).value * 2 +
                determiningComponents[2].inputTerminals.itemAt(0).value * 4 +
                determiningComponents[1].inputTerminals.itemAt(0).value * 8

        if (bcdCounter.inputTerminals.itemAt(0).wires.length == 0 ||
                bcdCounter.outputTerminals.itemAt(0).wires.length == 0 ||
                bcdCounter.outputTerminals.itemAt(1).wires.length == 0 ||
                bcdCounter.outputTerminals.itemAt(2).wires.length == 0 ||
                bcdCounter.outputTerminals.itemAt(3).wires.length == 0) {
            items.bonus.bad('tux')
            return
        }
        if ((bcdOutput == digitalLightOutput) && (bcdCounter.inputTerminals.itemAt(0).wires.length != 0) ) {
            items.bonus.good('tux')
            return
        }
        items.bonus.bad('tux')
    }
    else {
        if (determiningComponents[0].inputTerminals.itemAt(0).value == 1)
            items.bonus.good('tux')
        else
            items.bonus.bad('tux')
    }
}

function nextLevel() {

    if(numberOfLevel < ++currentLevel ) {
        currentLevel = 1
    }
    reset();
}

function previousLevel() {

    if(--currentLevel < 1) {
        currentLevel = numberOfLevel
    }
    reset();
}

function reset() {

    deselect()
    stop()
    items.availablePieces.model.clear()
    initLevel()
}

// Creates component from ListWidget to the drawing board area
function createComponent(x, y, componentIndex) {

    x = x / items.playArea.width
    y = y / items.playArea.height

    var index
    if(deletedIndex.length > 0) {
        index = deletedIndex[deletedIndex.length - 1]
        deletedIndex.pop()
    }
    else
        index = components.length

    var component = items.availablePieces.repeater.itemAt(componentIndex)
    var electricComponent = Qt.createComponent("qrc:/gcompris/src/activities/digital_electricity/components/" +
                                               component.source)

    //console.log("Error loading component:", electricComponent.errorString())
    components[index] = electricComponent.createObject(
                        items.playArea, {
                            "index": index,
                            "posX": x,
                            "posY": y,
                            "imgSrc": component.imageName,
                            "toolTipTxt": component.toolTipTxt,
                            "imgWidth": component.imageWidth,
                            "imgHeight": component.imageHeight,
                            "destructible": true
                        });

    toolDeleteSticky = false
    deselect()
    componentSelected(index)
    updateComponent(index)
}

/* Creates wire between two terminals. Condition for creation of wire is that an input terminal
 * can only be connected to 1 wire, output terminals can be connected by any number of wires, and
 * an input terminal can be connected with an output terminal only. 'connected' variable is used
 * to make sure that an input is connected by only 1 wire.
*/
function terminalPointSelected(terminal) {

    if(selectedTerminal == -1 || selectedTerminal == terminal)
        selectedTerminal = terminal
    else if((selectedTerminal.type != terminal.type) && (selectedTerminal.parent != terminal.parent)) {
        var inTerminal = terminal.type == "In" ? terminal : selectedTerminal
        var outTerminal = terminal.type == "Out" ? terminal : selectedTerminal
        if(connected[inTerminal] == undefined || connected[inTerminal] == -1) {
            createWire(inTerminal, outTerminal, true)
        }
        deselect()
    }
    else {
        deselect()
        selectedTerminal = terminal
        terminal.selected = true
    }
}

function createWire(inTerminal, outTerminal, destructible) {
    var wireComponent = Qt.createComponent("qrc:/gcompris/src/activities/digital_electricity/Wire.qml")
    var wire = wireComponent.createObject(
               items.playArea, {
                    "from": outTerminal,
                    "to": inTerminal,
                    "destructible": destructible
                });
    inTerminal.value = outTerminal.value
    inTerminal.wires.push(wire)
    outTerminal.wires.push(wire)
    updateWires(inTerminal.parent.index)
    updateWires(outTerminal.parent.index)
    updateComponent(inTerminal.parent.index)
    connected[inTerminal] = outTerminal
}

/* Updates the output of the component. 'wireVisited' is used to update the value of
 * each wire once which will avoid updating the outputs of components in an infinite loop.
*/
function updateComponent(index) {
    var wireVisited = []
    components[index].updateOutput(wireVisited)
}

/* Updates the orientation of the wire. It is called whenever a new wire is created or
 * an object is rotated.
*/
function updateWires(index) {

    var component = components[index]
    if(component == undefined || component.noOfInputs == undefined || component.noOfOutputs == undefined)
        return

    var rotatedAngle = component.initialAngle * Math.PI / 180
    for(var i = 0 ; i < component.noOfInputs ; ++i) {
        var terminal = component.inputTerminals.itemAt(i)
        if(terminal.wires.length != 0) {
            var wire = terminal.wires[0]
            var otherAngle = wire.from.parent.initialAngle * Math.PI / 180
            var x = wire.from.xCenterFromComponent
            var y = wire.from.yCenterFromComponent
            var x1 = wire.from.xCenter - x + x * Math.cos(otherAngle) - y * Math.sin(otherAngle)
            var y1 = wire.from.yCenter - y + x * Math.sin(otherAngle) + y * Math.cos(otherAngle)

            x = terminal.xCenterFromComponent
            y = terminal.yCenterFromComponent
            var x2 = terminal.xCenter - x + x * Math.cos(rotatedAngle) - y * Math.sin(rotatedAngle)
            var y2 = terminal.yCenter - y + x * Math.sin(rotatedAngle) + y * Math.cos(rotatedAngle)

            var width = Math.pow((Math.pow(x1 - x2, 2) +  Math.pow(y1 - y2, 2)),0.5) + 2
            var angle = (180/Math.PI)*Math.atan((y2-y1)/(x2-x1))
            if(x2 - x1 < 0) angle = angle - 180
            wire.x = x1
            wire.y = y1
            wire.width = width
            wire.rotation = angle
        }
    }
    for(var i = 0 ; i < component.noOfOutputs ; ++i) {
        var terminal = component.outputTerminals.itemAt(i)
        for(var j = 0 ; j < terminal.wires.length ; ++j) {
            var x = terminal.xCenterFromComponent
            var y = terminal.yCenterFromComponent
            var x1 = terminal.xCenter - x + x * Math.cos(rotatedAngle) - y * Math.sin(rotatedAngle)
            var y1 = terminal.yCenter - y + x * Math.sin(rotatedAngle) + y * Math.cos(rotatedAngle)

            var wire = terminal.wires[j]
            var otherAngle = wire.to.parent.initialAngle * Math.PI / 180
            x = wire.to.xCenterFromComponent
            y = wire.to.yCenterFromComponent
            var x2 = wire.to.xCenter - x + x * Math.cos(otherAngle) - y * Math.sin(otherAngle)
            var y2 = wire.to.yCenter - y + x * Math.sin(otherAngle) + y * Math.cos(otherAngle)

            var width = Math.pow((Math.pow(x1 - x2, 2) +  Math.pow(y1 - y2, 2)),0.5) + 2
            var angle = (180/Math.PI)*Math.atan((y2-y1)/(x2-x1))
            if(x2 - x1 < 0)
                angle = angle - 180
            wire.x = x1
            wire.y = y1
            wire.width = width
            wire.rotation = angle
        }
    }
}

function deselect() {

    if(toolDeleteSticky == false) {
        toolDelete = false
        items.availablePieces.toolDelete.state = "notSelected"
    }
    items.availablePieces.rotateLeft.state = "canNotBeSelected"
    items.availablePieces.rotateRight.state = "canNotBeSelected"
    items.availablePieces.info.state = "canNotBeSelected"
    items.infoTxt.visible = false
    selectedIndex = -1
    selectedTerminal = -1
    for(var i = 0 ; i < components.length ; ++i) {
        var component = components[i]
        for(var j = 0 ; j < component.noOfInputs ; ++j)
            component.inputTerminals.itemAt(j).selected = false
        for(var j = 0 ; j < component.noOfOutputs ; ++j)
            component.outputTerminals.itemAt(j).selected = false
    }
}

function removeComponent(index) {

    var component = components[index]
    for(var i = 0 ; i < component.noOfInputs ; ++i) {
        var terminal = component.inputTerminals.itemAt(i)
        if(terminal.wires.length != 0) // Input Terminal can have only 1 wire
            removeWire(terminal.wires[0])
    }
    for(var i = 0 ; i < component.noOfOutputs ; ++i) {
        var terminal = component.outputTerminals.itemAt(i)
        while (terminal.wires.length != 0) {
            removeWire(terminal.wires[0]) // Output Terminal can have more than 1 wire
        }
    }
    components[index].destroy()
    deletedIndex.push(index)
    deselect()
}

function removeWire(wire) {

    var inTerminal = wire.to
    var outTerminal = wire.from

    var removeIndex = inTerminal.wires.indexOf(wire)
    inTerminal.wires.splice(removeIndex,1)
    removeIndex = outTerminal.wires.indexOf(wire)
    outTerminal.wires.splice(removeIndex,1)
    connected[wire.to] = -1

    inTerminal.value = 0
    wire.destroy()
    updateComponent(inTerminal.parent.index)
    deselect()
}

function componentSelected(index) {

    selectedIndex = index
    items.availablePieces.rotateLeft.state = "canBeSelected"
    items.availablePieces.rotateRight.state = "canBeSelected"
    items.availablePieces.info.state = "canBeSelected"
}

function rotateLeft() {

    components[selectedIndex].rotationAngle = -2
    components[selectedIndex].rotateComponent.start()
}

function rotateRight() {

    components[selectedIndex].rotationAngle = 2
    components[selectedIndex].rotateComponent.start()
}

function displayInfo() {

    var component = components[selectedIndex]
    var componentTruthTable = component.truthTable
    deselect()
    items.infoTxt.visible = true
    items.infoTxt.text = component.information

    if(component.infoImageSrc != undefined) {
        items.infoImage.imgVisible = true
        items.infoImage.source = url + component.infoImageSrc
    }
    else {
        items.infoImage.imgVisible = false
        items.infoImage.source = ""
    }

    if(componentTruthTable.length == 0)
        items.displayTruthTable = false
    else {
        items.displayTruthTable = true
        var truthTable = items.truthTablesModel
        truthTable.clear()
        truthTable.rows = componentTruthTable.length
        truthTable.columns = componentTruthTable[0].length
        truthTable.inputs = component.noOfInputs
        truthTable.outputs = component.noOfOutputs
        for(var i = 0 ; i < componentTruthTable.length ; ++i)
            for(var j = 0 ; j < componentTruthTable[i].length ; ++j)
                truthTable.append({'value': componentTruthTable[i][j]})
    }
}

function updateToolTip(toolTipTxt) {
    items.toolTip.show(toolTipTxt)
}
