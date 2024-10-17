import { PromptTemplate } from '@langchain/core/prompts';
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";

export const PROJECT_ID = "skills-network"

const model = new WatsonxAI({
  // ibmCloudApiKey: "set_when_using_your_own_account",
  projectId: PROJECT_ID,
  modelId: "meta-llama/llama-3-2-90b-vision-instruct",
  modelParameters: {
    max_new_tokens: 200,
    min_new_tokens: 0,
    stop_sequences: [],
    repetition_penalty: 1,
  },
});

// Define the prompt template
const template = `
<|begin_of_text|>
<|start_header_id|>system<|end_header_id|>
You are a talented and fun barista working at Tech Cafe.

 Your main task is to create 1-3 sentences to write on the coffee.

This is a fun thing we do to ensure our customers have a great experiance.

Make sure to reference the coffee they are ordering, their name, and their customizations [indirectly, don't list the customizations].

Do NOT describe the coffee, instead be creative and poetic.

ONLY respond with the message to write on the coffee NOTHING else.
<|eot_id|>
<|start_header_id|>user<|end_header_id|>
A customer just purchased the following coffee:
- Customer Name: {name}
- Type of Coffee: {coffeeName}
- Number of Creams: {creams}
- Number of Milks: {milk}
- Number of Sugars: {sugars}
- Number of Sweeteners: {sweeteners}
- Number of Whipped Cream: {whippedCream}
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ['name', 'coffeeName', 'creams', 'milk', 'sugars', 'sweeteners', 'whippedCream'],
});

/**
 * Generates a personalized message for the customer based on their order.
 * @param name - Customer's name
 * @param order - Customer's order details
 * @returns A fun and appropriate message string
 */
export async function generateMessage(name: string, order: any): Promise<string> {
  const promptText = await prompt.format({
    name: name,
    coffeeName: order.coffeeName,
    creams: order.customizations.creams ?? 0,
    milk: order.customizations.milk ?? 0,
    sugars: order.customizations.sugars ?? 0,
    sweeteners: order.customizations.sweeteners ?? 0,
    whippedCream: order.customizations.whippedCream ? 'Yes' : 'No',
  });

  const response = await model.invoke(promptText);
  return response;
}