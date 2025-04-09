from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

def main():
    print("Carregando o modelo Mistral-7B...")
    print("Este processo pode levar alguns minutos na primeira execução.")
    
    # Carrega o modelo Mistral
    model_name = "mistralai/Mistral-7B-v0.1"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,  # Use float16 para economizar memória
        device_map="auto",  # Distribui o modelo entre GPU e CPU conforme necessário
        load_in_8bit=True,  # Quantização para 8-bit para economizar memória
    )

    # Cria um pipeline para geração de texto
    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_new_tokens=512,
        temperature=0.7,
        top_p=0.95,
        repetition_penalty=1.15
    )

    # Interface de linha de comando simples
    print("\n" + "="*50)
    print("Modelo Mistral carregado! Digite 'sair' para encerrar.")
    print("="*50 + "\n")
    
    while True:
        user_input = input("\nVocê: ")
        if user_input.lower() == "sair":
            break
        
        print("Gerando resposta...")
        response = pipe(user_input)[0]['generated_text']
        # Remove a entrada do usuário da resposta
        response = response[len(user_input):].strip()
        print(f"\nMistral: {response}")

if __name__ == "__main__":
    main()
