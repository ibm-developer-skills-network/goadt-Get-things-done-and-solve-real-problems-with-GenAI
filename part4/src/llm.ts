import axios from 'axios';
import { getToken } from './utils';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";

export const PROJECT_ID = "skills-network";

const model = new WatsonxAI({
  // ibmCloudApiKey: "set_when_using_your_own_account",
  projectId: PROJECT_ID,
  modelId: "meta-llama/llama-3-2-90b-vision-instruct",
  modelParameters: {
    // max_new_tokens: 200,
    // min_new_tokens: 0,
    // stop_sequences: [],
    // repetition_penalty: 1,
    decoding_method: "greedy",
    min_new_tokens: 0,
    stop_sequences: [],
    repetition_penalty: 1,
    max_tokens: 900
  },
});



const systemPrompt = `You are a talented and fun barista working at Tech Cafe.

 Your main task is to create 1-3 sentences to write on the coffee.

This is a fun thing we do to ensure our customers have a great experiance.

Make sure to reference the coffee they are ordering, their name, and their customizations [indirectly, don't list the customizations].

Do NOT describe the coffee, instead be creative and poetic.

ONLY respond with the message to write on the coffee NOTHING else.`

const userPrompt = `A customer just purchased the following coffee:
- Customer Name: {name}
- Type of Coffee: {coffeeName}
- Number of Creams: {creams}
- Number of Milks: {milk}
- Number of Sugars: {sugars}
- Number of Sweeteners: {sweeteners}
- Number of Whipped Cream: {whippedCream}`;

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  ["user", userPrompt],
  ["assistant", ""],
]);

/**
 * Generates a personalized message for the customer based on their order.
 * @param name - Customer's name
 * @param order - Customer's order details
 * @returns A fun and appropriate message string
 */
export async function generateMessage(name: string, order: any): Promise<string> {
  const promptText = await chatPrompt.format({
    name: name,
    coffeeName: order.coffeeName,
    creams: order.customizations.creams,
    milk: order.customizations.milk,
    sugars: order.customizations.sugars,
    sweeteners: order.customizations.sweeteners,
    whippedCream: order.customizations.whippedCream ? 'Yes' : 'No',
  });

  const response = await model.invoke(promptText);
  return response;
}



/**
 * Scans an image and returns the number of people in the image.
 * @param image - The image to scan (base64 encoded, e.g. it will start with "data:image/png;base64,")
 * @returns A fun and appropriate message string
 */
export async function scanImage(imageURI: string): Promise<number> {
  console.log('STARTING SCAN')

  const systemPrompt = `Return how many people you see in the image. Only return the number with no punctuation or quotes and be as accurate as possible.`

  const accessToken = await getToken();

  const url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29";
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  };
  
  const body = {
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: systemPrompt
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageURI
            }
          }
        ]
      }
    ],
    project_id: PROJECT_ID,
    model_id: "meta-llama/llama-3-2-90b-vision-instruct",
    decoding_method: "greedy",
    min_new_tokens: 0,
    max_tokens: 3
  };

  try {
    const response = await axios.post(url, body, { headers });
    const resultNumber = response.data?.choices[0]?.message?.content;

    return parseInt(resultNumber);
  } catch (error: any) {
    console.error('Error fetching data:', error);

    console.log('------------------------------')
    console.error('Error fetching data:', error.response.data);

    console.log('------------------------------')
    console.error('Error fetching data:', JSON.stringify(error.response.data));

    throw new Error("Non-200 response");
  }

}
