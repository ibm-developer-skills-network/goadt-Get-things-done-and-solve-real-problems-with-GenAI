import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import fs from 'fs';
import { generateMessage } from './llm';

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
    const coffeeOptions = {
        coffeeName: state.coffeeName,
        customizations: state.customizations
    }

    const message = await generateMessage(state.customerName, coffeeOptions)
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
