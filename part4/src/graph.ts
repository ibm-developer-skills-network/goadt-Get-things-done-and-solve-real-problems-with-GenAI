import { Annotation, StateGraph, MemorySaver, START, END } from '@langchain/langgraph';
import fs from 'fs';
import { generateMessage, scanImage } from './llm';
import { imageToBase64 } from './utils';
import { setCoffeePrice } from './controllers/coffeeController';

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
    salePercentage: Annotation<number>,
});

const stepGetLatestImage = async (state: typeof ImageAnnotation.State) => {
    const filePath = '/Users/bradley/Code/github.com/gp-cafe/src/street2.png';
    const base64ImageWithPrefix = imageToBase64(filePath);
    state.imageURI = base64ImageWithPrefix;

    return state;
}

const stepScanImage = async (state: typeof ImageAnnotation.State) => {
    const scanResults = await scanImage(state.imageURI);
    state.numPeople = scanResults;
    return state;
}

const stepEstimateSale = async (state: typeof ImageAnnotation.State) => {
    if (state.numPeople > 40) {
        state.salePercentage = 50;
    } else if (state.numPeople > 20) {
        state.salePercentage = 20;
    } else {
        state.salePercentage = 0;
    }
    return state;
}

const stepStartSale = async (state: typeof ImageAnnotation.State) => {
    setCoffeePrice(state.salePercentage);
    return state;
}

const postScan = async (state: typeof ImageAnnotation.State) => {
    if (state.numPeople > 20) {
        return "stepStartSale"
    }
    return END;
}


// Set up memory
const graphStateMemory = new MemorySaver()

const scanImageGraph = new StateGraph(ImageAnnotation)
    .addNode("stepGetLatestImage", stepGetLatestImage)
    .addNode("stepScanImage", stepScanImage)
    .addNode("stepStartSale", stepStartSale)
    .addNode("stepEstimateSale", stepEstimateSale)
    .addEdge(START, "stepGetLatestImage")
    .addEdge("stepGetLatestImage", "stepScanImage")
    .addEdge("stepScanImage", "stepEstimateSale")
    // Third parameter is to support visualizing the graph
    .addConditionalEdges("stepEstimateSale", postScan, ["stepStartSale", END])
    .addEdge("stepStartSale", END)
    .compile({
        checkpointer: graphStateMemory,
        interruptBefore: ["stepStartSale"]
    });

const demoStateConfig = { configurable: { thread_id: "1" }, streamMode: "values" as const };

export const getScanImageGraphState = async () => {
    const currState = await scanImageGraph.getState(demoStateConfig);
    return currState;
};

export const updateScanImageGraphState = async (toUpdate: Partial<typeof ImageAnnotation.State>) => {
    const currState = await scanImageGraph.getState(demoStateConfig);
    await scanImageGraph.updateState(demoStateConfig, { ...currState.values, ...toUpdate });
};

export const runScanImageGraph = async (initialInput: Partial<typeof ImageAnnotation.State>|null = null) => {
    for await (const event of await scanImageGraph.stream(initialInput, demoStateConfig)) {
        console.log(`--- ${event.numPeople} ---`);
    }
};

export const printScanImageGraph = async () => {
    const representation = scanImageGraph.getGraph();
    const image = await representation.drawMermaidPng();
    const arrayBuffer = await image.arrayBuffer();
    // Save the image to a file
    fs.writeFileSync('scan_image_graph.png', Buffer.from(arrayBuffer));
}
