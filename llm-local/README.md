# Guia para Rodar Modelos de Linguagem (como Mistral) Localmente

Este guia apresenta duas abordagens para rodar modelos de linguagem grandes (LLMs) como o Mistral localmente em seu computador.

## Requisitos de Sistema

Você já possui os requisitos necessários:

- Python 3.11.4
- NVIDIA GeForce RTX 4090
- CUDA 12.6
- 24GB de VRAM (ideal para modelos maiores)

## Opção 1: Usando Ollama (Recomendado para iniciantes)

Ollama é uma ferramenta que simplifica o processo de baixar e rodar modelos de linguagem localmente.

### Instalação do Ollama

1. Baixe o instalador do Ollama para Windows no site oficial:
   [https://ollama.com/download/windows](https://ollama.com/download/windows)

2. Execute o instalador e siga as instruções na tela.

3. Após a instalação, o Ollama estará disponível como um aplicativo e também via linha de comando.

### Baixando e Rodando o Modelo Mistral

1. Abra o PowerShell ou o Prompt de Comando e execute:

```powershell
ollama run mistral
```

Este comando baixará o modelo Mistral (se ainda não estiver baixado) e iniciará uma sessão de chat interativa.

2. Para listar todos os modelos disponíveis:

```powershell
ollama list
```

3. Para baixar outros modelos sem iniciar uma sessão:

```powershell
ollama pull llama3
ollama pull mistral-large
```

### Usando o Ollama com uma Interface Web

1. Você pode usar o Ollama com uma interface web como o LM Studio ou o Open WebUI:

```powershell
# Instalar Open WebUI
pip install open-webui
open-webui --backend ollama
```

## Opção 2: Usando llama.cpp (Mais flexível e configurável)

llama.cpp é uma implementação eficiente em C++ para rodar modelos de linguagem em CPUs e GPUs.

### Instalação do llama.cpp

1. Clone o repositório e compile:

```powershell
cd llm-local
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
mkdir build
cd build
cmake .. -DLLAMA_CUBLAS=ON
cmake --build . --config Release
```

2. Baixe um modelo Mistral em formato GGUF:

```powershell
# Volte para o diretório llama.cpp
cd ..
mkdir models
cd models
# Baixe o modelo Mistral 7B
curl -L https://huggingface.co/TheBloke/Mistral-7B-v0.1-GGUF/resolve/main/mistral-7b-v0.1.Q4_K_M.gguf -o mistral-7b-v0.1.Q4_K_M.gguf
```

3. Execute o modelo:

```powershell
# Volte para o diretório llama.cpp
cd ..
.\build\bin\Release\main.exe -m .\models\mistral-7b-v0.1.Q4_K_M.gguf -n 1024 --color -i -ins -ngl 100
```

## Opção 3: Usando Python com Transformers e CUDA

Esta opção usa a biblioteca Hugging Face Transformers para rodar modelos diretamente via Python.

1. Crie um ambiente virtual e instale as dependências:

```powershell
cd llm-local
python -m venv venv
.\venv\Scripts\activate
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install transformers accelerate bitsandbytes
```

2. Crie um script Python para rodar o modelo:

```python
# Crie um arquivo chamado run_mistral.py
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

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
print("Modelo Mistral carregado! Digite 'sair' para encerrar.")
while True:
    user_input = input("\nVocê: ")
    if user_input.lower() == "sair":
        break

    response = pipe(user_input)[0]['generated_text']
    # Remove a entrada do usuário da resposta
    response = response[len(user_input):].strip()
    print(f"\nMistral: {response}")
```

3. Execute o script:

```powershell
python run_mistral.py
```

## Configurações Avançadas

### Ajustando Parâmetros de Inferência

Para melhorar a qualidade das respostas ou a velocidade:

- **Temperatura**: Controla a aleatoriedade (0.0 a 1.0). Valores mais baixos = respostas mais determinísticas.
- **Top-p (nucleus sampling)**: Controla a diversidade (0.0 a 1.0).
- **Repetition penalty**: Evita repetições (valores > 1.0).

### Otimizando para sua GPU

Com sua RTX 4090, você pode ajustar:

- **Tamanho do contexto**: Até 8K-32K tokens dependendo do modelo.
- **Quantização**: Experimente diferentes níveis (Q4_K_M, Q5_K_M, Q6_K) para equilibrar qualidade e velocidade.
- **Número de camadas na GPU**: Use `-ngl 100` para colocar todas as camadas na GPU.

## Modelos Recomendados para RTX 4090

Sua GPU pode rodar confortavelmente:

- Mistral 7B e 8x7B
- Llama 3 8B
- Mixtral 8x7B
- Phi-3 (14B)
- Gemma 7B e 27B (quantizado)
- Falcon 40B (quantizado)

## Solução de Problemas

- **Erro de memória CUDA**: Tente um modelo menor ou com maior quantização.
- **Lentidão**: Verifique se o CUDA está sendo usado corretamente.
- **Respostas de baixa qualidade**: Ajuste os parâmetros de geração.

## Recursos Adicionais

- [Documentação do Ollama](https://github.com/ollama/ollama)
- [Documentação do llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)
- [Modelos GGUF no Hugging Face](https://huggingface.co/TheBloke)
