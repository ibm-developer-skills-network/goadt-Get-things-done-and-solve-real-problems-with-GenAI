import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import fs from 'fs';
import { generateMessage, scanImage } from './llm';
import { imageToBase64 } from './utils';

interface CoffeeCustomizations {
    creams: number,
    milks: number,
    sugars: number,
    sweeteners: number,
    whippedCream: boolean,
}

const CoffeeAnnotation = Annotation.Root({
    customerName: Annotation<string>,
    coffeeName: Annotation<string>,
    customizations: Annotation<CoffeeCustomizations>,
    message: Annotation<string>,
});

const stepGenerateMessage = async (state: typeof CoffeeAnnotation.State) => {
    let coffeeOptions = {
        coffeeName: state.coffeeName,
        customizations: state.customizations
    }

    let message = await generateMessage(state.customerName, coffeeOptions)
    state.message = message;

    return state;
}

const coffeeMessageGraph = new StateGraph(CoffeeAnnotation)
    .addNode("generateMessage", stepGenerateMessage)
    .addEdge(START, "generateMessage")
    .addEdge("generateMessage", END)
    .compile();


export const runCoffeeMessageGraph = async (initialInput: typeof CoffeeAnnotation.State) => {
    return coffeeMessageGraph.invoke(initialInput);
}

export const printCoffeeMessageGraph = async () => {
    const representation = coffeeMessageGraph.getGraph();
    const image = await representation.drawMermaidPng();
    const arrayBuffer = await image.arrayBuffer();
    // Save the image to a file
    fs.writeFileSync('coffee_message_graph.png', Buffer.from(arrayBuffer));
}


const ImageAnnotation = Annotation.Root({
    imageURI: Annotation<string>,
    numPeople: Annotation<number>,
});

const stepGetLatestImage = async (state: typeof ImageAnnotation.State) => {
    const filePath = '/Users/bradley/Code/github.com/gp-cafe/src/street2.png';
    const base64ImageWithPrefix = imageToBase64(filePath);
    state.imageURI = base64ImageWithPrefix;

    return state;
}

const stepScanImage = async (state: typeof ImageAnnotation.State) => {

    console.log('stepScanImage')
    console.log(state)

    const scanResults = await scanImage(state.imageURI);
    state.numPeople = scanResults;
    return state;
}

const scanImageGraph = new StateGraph(ImageAnnotation)
    .addNode("stepGetLatestImage", stepGetLatestImage)
    .addNode("stepScanImage", stepScanImage)
    .addEdge(START, "stepGetLatestImage")
    .addEdge("stepGetLatestImage", "stepScanImage")
    .addEdge("stepScanImage", END)
    .compile();

export const runScanImageGraph = async (initialInput: Partial<typeof ImageAnnotation.State> = {}) => {
    return scanImageGraph.invoke(initialInput);
};

export const printScanImageGraph = async () => {
    const representation = scanImageGraph.getGraph();
    const image = await representation.drawMermaidPng();
    const arrayBuffer = await image.arrayBuffer();
    // Save the image to a file
    fs.writeFileSync('scan_image_graph.png', Buffer.from(arrayBuffer));
}
