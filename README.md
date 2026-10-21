# CenariLog Academy

## Histórico de versões e guia didático de funcionamento

**Versão do documento:** 1.0  
**Aplicação:** CenariLog Academy 3.0  
**Finalidade:** apresentar a evolução do simulador e ensinar seu uso de forma simples, progressiva e prática.

---

## 1. O que é o CenariLog Academy?

O **CenariLog Academy** é um simulador educacional de logística. A ferramenta permite preencher dados de uma operação, calcular indicadores, comparar cenários e observar como diferentes decisões podem afetar o atendimento, o estoque, o prazo, o custo e o risco.

A proposta de aprendizagem é baseada na pergunta:

> **O que pode acontecer se eu alterar uma condição da operação?**

O simulador não substitui um ERP, WMS, TMS, inventário físico ou análise profissional. O objetivo é ajudar estudantes e usuários iniciantes a compreender relações entre dados, indicadores e decisões logísticas.

Link do Simulador: [Acesse o CenariLog Academy](https://cenarilog-academy.vercel.app/)  
--- 

## 2. Evolução das versões

### 2.1 Versão 1.0: fundamentos dos indicadores

A primeira versão estabeleceu a base do simulador.

#### Principais recursos

- Cadastro da operação atual.
- Criação de um cenário simulado.
- Comparação entre valores atuais e simulados.
- Definição de metas personalizadas.
- Cálculo dos principais indicadores logísticos.
- Gráfico comparativo entre atual, simulado e meta.
- Diagnóstico automático do cenário.
- Salvamento de cenários no navegador.

#### Indicadores da versão 1.0

- OTIF.
- OTD.
- Fill Rate.
- Ruptura.
- Giro de estoque.
- Lead time.
- Acuracidade.
- Custo por pedido.

#### Aprendizado principal

A versão 1.0 ensina que uma operação não deve ser avaliada por apenas um número. Prazo, completude, disponibilidade, estoque e custo precisam ser analisados em conjunto.

---

### 2.2 Versão 2.0: produtos e planejamento mensal

A segunda versão ampliou o simulador para o nível de produtos e planejamento ao longo do tempo.

#### Principais recursos

- Cadastro individual de produtos ou SKUs.
- Cálculo do valor atual do estoque.
- Cálculo do valor anual de consumo.
- Classificação de produtos pela Curva ABC.
- Importação e exportação de produtos em CSV.
- Simulação da operação ao longo de 12 meses.
- Aplicação de fatores de sazonalidade.
- Comparação entre lote manual e EOQ.
- Cálculo de custos de armazenagem e pedidos.
- Salvamento e comparação de cenários mensais.

#### Aprendizado principal

A versão 2.0 ensina que os produtos não possuem a mesma importância financeira e que a demanda pode variar ao longo dos meses. Também mostra que aumentar estoque pode reduzir ruptura, mas normalmente eleva o capital empregado e o custo de armazenagem.

---

### 2.3 Versão 3.0: decisões, riscos e otimização

A terceira versão transformou o simulador em um laboratório de decisões logísticas.

#### Principais recursos

- Desafios operacionais predefinidos.
- Seleção de decisões para melhorar a operação.
- Aplicação de impactos estimados sobre as métricas.
- Restrições de serviço, custo, estoque e prazo.
- Pontuação ponderada do cenário.
- Pesos configuráveis para serviço, custo, estoque e risco.
- Cadastro e classificação de riscos.
- Matriz de probabilidade e impacto.
- Otimizador de combinações de decisões.
- Histórico de execuções.
- Backup completo em JSON.

#### Aprendizado principal

A versão 3.0 ensina que toda decisão possui benefícios, custos e riscos. A melhor alternativa depende das prioridades do cenário, não apenas do maior indicador ou do menor custo.

---

## 3. Visão geral do fluxo de aprendizagem

O uso didático recomendado segue sete etapas:

1. Entender os dados de entrada.
2. Registrar ou revisar a operação atual.
3. Copiar a operação para o cenário simulado.
4. Alterar uma variável por vez.
5. Comparar indicadores, metas e alertas.
6. Registrar a conclusão da experiência.
7. Salvar ou exportar o cenário.

### Regra de ouro

> Nas primeiras simulações, altere somente uma variável por vez.

Essa prática facilita identificar qual mudança provocou o efeito observado.

---

## 4. Operação atual e cenário simulado

### Operação atual

Representa a situação de referência. Pode conter dados reais, dados acadêmicos ou os valores de exemplo da ferramenta.

### Cenário simulado

Representa uma hipótese futura. O usuário altera dados para testar perguntas como:

- E se o fornecedor reduzir o lead time?
- E se o estoque de segurança aumentar?
- E se mais pedidos forem entregues completos?
- E se o custo logístico aumentar para melhorar o serviço?

### Exemplo didático

| Campo | Atual | Simulado |
|---|---:|---:|
| Lead time médio | 7 dias | 5 dias |
| Pedidos no prazo | 940 | 970 |
| Pedidos no prazo e completos | 900 | 950 |
| Unidades atendidas | 4.700 | 5.300 |

O cenário simulado não afirma que a melhoria acontecerá. O cenário mostra o resultado matemático caso as novas condições sejam alcançadas.

---

## 5. Significado dos dados de entrada

| Campo | Explicação simples | Unidade comum |
|---|---|---|
| Demanda no período | Quantidade consumida, vendida ou solicitada | unidades |
| Estoque médio | Média do estoque mantido no período | unidades |
| Total de pedidos | Quantidade total de pedidos avaliados | pedidos |
| Pedidos entregues no prazo | Pedidos que respeitaram o prazo acordado | pedidos |
| Pedidos no prazo e completos | Pedidos que cumpriram prazo e quantidade | pedidos |
| Unidades solicitadas | Total de unidades pedidas | unidades |
| Unidades atendidas | Total de unidades efetivamente atendidas | unidades |
| Lead time médio | Prazo médio do processo | dias |
| Itens conferidos | Itens verificados no inventário | itens |
| Itens corretos | Itens compatíveis com o registro | itens |
| Custo logístico total | Custos considerados no cenário | R$ |
| Demanda média diária | Consumo médio por dia | unidades/dia |
| Demanda máxima diária | Maior consumo diário considerado | unidades/dia |
| Lead time máximo | Maior prazo considerado | dias |
| Estoque disponível | Saldo disponível para atendimento | unidades |

---

## 6. Regras de consistência

O simulador verifica relações que precisam ser verdadeiras:

- Pedidos no prazo não podem superar o total de pedidos.
- Pedidos no prazo e completos não podem superar os pedidos no prazo.
- Pedidos no prazo e completos não podem superar o total de pedidos.
- Unidades atendidas não podem superar as unidades solicitadas.
- Itens corretos não podem superar os itens conferidos.
- Demanda máxima diária deve ser igual ou maior que a demanda média diária.
- Lead time máximo deve ser igual ou maior que o lead time médio.
- Total de pedidos, unidades solicitadas e itens conferidos precisam ser maiores que zero para o cálculo das taxas.

Quando existe uma inconsistência, o cenário deve ser corrigido antes de ser salvo ou interpretado.

---

## 7. Indicadores logísticos

### 7.1 OTIF

**OTIF** significa *On Time In Full*.

Responde à pergunta:

> Quantos pedidos foram entregues no prazo e completos?

```text
OTIF (%) = Pedidos no prazo e completos ÷ Total de pedidos × 100
```

**Exemplo:**

```text
900 ÷ 1.000 × 100 = 90%
```

**Interpretação:** 90 de cada 100 pedidos cumpriram simultaneamente prazo e completude.

**Direção desejada:** quanto maior, melhor.

---

### 7.2 OTD

**OTD** significa *On Time Delivery*.

Responde à pergunta:

> Quantos pedidos foram entregues no prazo?

```text
OTD (%) = Pedidos entregues no prazo ÷ Total de pedidos × 100
```

**Exemplo:**

```text
940 ÷ 1.000 × 100 = 94%
```

**Interpretação:** OTD analisa pontualidade, mas não garante que o pedido chegou completo.

**Direção desejada:** quanto maior, melhor.

---

### 7.3 Fill Rate

Responde à pergunta:

> De todas as unidades solicitadas, qual percentual foi atendido?

```text
Fill Rate (%) = Unidades atendidas ÷ Unidades solicitadas × 100
```

**Exemplo:**

```text
4.700 ÷ 5.000 × 100 = 94%
```

**Direção desejada:** quanto maior, melhor.

---

### 7.4 Ruptura

Responde à pergunta:

> Qual percentual da demanda não foi atendido?

```text
Ruptura (%) = (Unidades solicitadas - Unidades atendidas) ÷ Unidades solicitadas × 100
```

**Exemplo:**

```text
(5.000 - 4.700) ÷ 5.000 × 100 = 6%
```

**Direção desejada:** quanto menor, melhor.

Quando Fill Rate e ruptura usam a mesma base, os dois indicadores são complementares.

---

### 7.5 Giro de estoque

Responde à pergunta:

> Quantas vezes o estoque médio foi consumido no período?

```text
Giro = Demanda do período ÷ Estoque médio
```

**Exemplo:**

```text
5.000 ÷ 1.500 = 3,33 vezes
```

O giro deve ser interpretado considerando o período. Um giro mensal não pode ser comparado diretamente com um giro anual.

---

### 7.6 Lead time

Responde à pergunta:

> Quanto tempo o processo demora?

```text
Lead time médio = Soma dos tempos observados ÷ Quantidade de observações
```

**Exemplo:**

```text
(4 + 5 + 6) ÷ 3 = 5 dias
```

**Direção desejada:** quanto menor, melhor, desde que custo, qualidade e confiabilidade sejam preservados.

---

### 7.7 Acuracidade

Responde à pergunta:

> Quanto o estoque físico coincide com o registro?

```text
Acuracidade (%) = Itens corretos ÷ Itens conferidos × 100
```

**Exemplo:**

```text
970 ÷ 1.000 × 100 = 97%
```

**Direção desejada:** quanto maior, melhor.

---

### 7.8 Custo por pedido

Responde à pergunta:

> Quanto a logística custa, em média, para cada pedido?

```text
Custo por pedido = Custo logístico total ÷ Total de pedidos
```

**Exemplo:**

```text
R$ 24.000 ÷ 1.000 = R$ 24,00 por pedido
```

**Direção desejada:** quanto menor, melhor, desde que o atendimento não seja prejudicado.

---

## 8. Metas, cores e variações

O simulador utiliza metas configuráveis para classificar o resultado.

| Cor | Significado |
|---|---|
| Verde | Meta alcançada |
| Amarelo | Resultado próximo da meta |
| Vermelho | Resultado fora da meta |

As setas mostram apenas a direção da mudança:

- Seta para cima: o valor aumentou.
- Seta para baixo: o valor diminuiu.

A direção precisa ser interpretada conforme o indicador. Aumentar OTIF é favorável; aumentar ruptura ou custo pode ser desfavorável.

```text
Variação = Resultado simulado - Resultado atual
```

Para indicadores percentuais, a diferença direta é lida em pontos percentuais.

---

## 9. Planejamento de reposição

### 9.1 Demanda durante o lead time

Estima o consumo durante a espera pela reposição.

```text
Demanda durante o lead time = Demanda média diária × Lead time médio
```

### 9.2 Estoque de segurança

Protege a operação contra aumento de demanda e atraso de reposição.

```text
Estoque de segurança =
(Demanda máxima diária × Lead time máximo)
-
(Demanda média diária × Lead time médio)
```

O simulador não permite estoque de segurança negativo.

### 9.3 Ponto de reposição

Indica o nível de estoque que deve disparar uma nova compra.

```text
Ponto de reposição = Demanda durante o lead time + Estoque de segurança
```

```text
Precisa repor = Estoque disponível ≤ Ponto de reposição
```

---

## 10. Cadastro de produtos

Cada produto pode ser registrado com:

- Código.
- Descrição.
- Categoria.
- Demanda anual.
- Estoque atual.
- Custo unitário.
- Demanda diária média.
- Lead time.
- Estoque de segurança.

### Valor atual do estoque

```text
Valor do estoque = Estoque atual × Custo unitário
```

### Valor anual de consumo

```text
Valor anual de consumo = Demanda anual × Custo unitário
```

---

## 11. Curva ABC

A Curva ABC organiza os produtos pela participação no valor anual de consumo.

### Processo de cálculo

1. Calcular o valor anual de cada produto.
2. Ordenar os produtos do maior para o menor valor.
3. Calcular a participação de cada item no total.
4. Somar as participações progressivamente.
5. Aplicar a classificação A, B ou C.

```text
Participação (%) = Valor anual do produto ÷ Valor anual total × 100
```

| Classe | Regra inicial do simulador | Interpretação |
|---|---:|---|
| A | Até 80% acumulados | Maior impacto financeiro |
| B | De 80% até 95% | Impacto intermediário |
| C | Acima de 95% | Menor participação financeira |

A classe financeira não substitui a avaliação de criticidade. Um item C pode ser essencial para a operação.

---

## 12. Simulação mensal

A simulação distribui a demanda anual entre 12 meses e acompanha:

- Estoque inicial.
- Demanda prevista.
- Recebimentos.
- Demanda atendida.
- Estoque final.
- Ruptura.
- Nível de serviço.
- Custo de armazenagem.
- Custo de pedidos.

### Demanda sazonal

```text
Demanda do mês =
Demanda anual × Fator do mês ÷ Soma dos 12 fatores
```

Os fatores mensais funcionam como pesos. Um fator maior aumenta a participação da demanda naquele mês.

### Operações mensais

```text
Estoque disponível = Estoque inicial + Recebimentos
```

```text
Demanda atendida = mínimo entre Estoque disponível e Demanda prevista
```

```text
Ruptura em unidades = máximo entre 0 e Demanda prevista - Estoque disponível
```

```text
Estoque final = máximo entre 0 e Estoque disponível - Demanda atendida
```

```text
Nível de serviço (%) = Demanda atendida ÷ Demanda prevista × 100
```

---

## 13. Lote Econômico de Compra

O EOQ ou LEC estima uma quantidade de pedido que equilibra custos de emissão e armazenagem.

```text
EOQ = √((2 × D × S) ÷ H)
```

Onde:

- **D** = demanda anual.
- **S** = custo fixo por pedido.
- **H** = custo anual de armazenagem por unidade.

```text
H = Custo unitário × Taxa anual de armazenagem
```

### Regra de memorização

- EOQ responde: **quanto pedir?**
- Ponto de reposição responde: **quando pedir?**

---

## 14. Custos de estoque

```text
Estoque médio mensal = (Estoque inicial + Estoque final) ÷ 2
```

```text
Custo mensal de armazenagem =
Estoque médio mensal × Custo unitário × Taxa anual ÷ 12
```

```text
Custo anual do módulo =
Soma dos custos mensais de armazenagem
+
Soma dos custos de pedidos
```

O cenário de menor estoque não é necessariamente o melhor, pois a falta de estoque pode aumentar a ruptura.

---

## 15. Desafios e decisões operacionais

O módulo de desafios apresenta uma situação inicial e permite aplicar decisões predefinidas.

| Decisão | Efeito didático esperado | Possível contrapartida |
|---|---|---|
| Aumentar estoque de segurança | Reduz ruptura e melhora atendimento | Aumenta estoque e custo |
| Transporte expresso | Reduz prazo e melhora pontualidade | Aumenta custo |
| Revisar fornecedor | Melhora prazo e disponibilidade | Exige negociação ou transição |
| Contagem cíclica | Melhora acuracidade | Consome tempo da equipe |
| Aumentar capacidade | Reduz atrasos | Pode exigir investimento |
| Revisar previsão | Melhora equilíbrio de estoque | Exige dados e revisão frequente |

```text
Métrica simulada = Métrica inicial + Soma dos impactos das decisões
```

Os impactos são hipóteses didáticas configuradas no simulador. Eles não representam garantia de resultado real.

---

## 16. Pontuação ponderada

O cenário recebe pontuações para:

- Serviço.
- Custo.
- Estoque.
- Risco.

```text
Pontuação geral =
(Serviço × Peso de serviço
+ Custo × Peso de custo
+ Estoque × Peso de estoque
+ Risco × Peso de risco)
÷ Soma dos pesos
```

Os pesos representam prioridades. Um peso maior para serviço favorece alternativas voltadas ao atendimento. Um peso maior para custo favorece alternativas econômicas.

A pontuação é uma regra interna do CenariLog Academy e não um padrão universal do mercado.

---

## 17. Matriz de risco

Para cada risco, o usuário informa:

- Nome.
- Categoria.
- Probabilidade.
- Impacto.
- Responsável.
- Plano de ação.

```text
Pontuação do risco = Probabilidade × Impacto
```

| Pontuação | Nível | Orientação didática |
|---:|---|---|
| 1 a 4 | Baixo | Monitorar |
| 5 a 9 | Moderado | Definir controle e acompanhar |
| 10 a 16 | Alto | Priorizar mitigação |
| 17 a 25 | Crítico | Agir e escalar imediatamente |

A matriz organiza prioridades, mas não substitui análise detalhada ou plano de ação.

---

## 18. Otimizador de cenários

O otimizador:

1. Gera combinações das decisões disponíveis.
2. Limita a quantidade de decisões simultâneas.
3. Recalcula as métricas.
4. Aplica os pesos configurados.
5. Ordena as combinações pela pontuação.
6. Em empate aproximado, favorece menor acréscimo de custo.
7. Apresenta as melhores alternativas encontradas.

O recurso executa uma comparação combinatória discreta. Ele não é uma inteligência autônoma e não garante a melhor decisão real.

---

## 19. Salvamento e backup

### Cenários salvos

Os cenários ficam armazenados no navegador por meio do armazenamento local.

### Backup JSON

O backup pode incluir:

- Operação atual.
- Cenário simulado.
- Metas.
- Nome do cenário.
- Observações.
- Cenários salvos.

### CSV

O módulo de produtos permite importação e exportação em CSV. Recomenda-se usar o modelo gerado pela própria ferramenta.

### Atenção

Dados armazenados no navegador podem ser perdidos se o armazenamento do site for apagado. Exporte backups periodicamente.

---

## 20. Roteiro de aula ou estudo

### Aula 1: conhecendo os indicadores

1. Restaurar os dados de exemplo.
2. Copiar a operação atual para o cenário simulado.
3. Alterar pedidos no prazo.
4. Comparar OTD e OTIF.
5. Registrar a conclusão.

### Aula 2: atendimento e ruptura

1. Alterar unidades atendidas.
2. Observar Fill Rate.
3. Observar ruptura.
4. Explicar por que os dois indicadores se movem em sentidos opostos.

### Aula 3: prazo e reposição

1. Alterar o lead time médio.
2. Observar demanda durante o lead time.
3. Observar ponto de reposição.
4. Verificar necessidade de compra.

### Aula 4: produtos e Curva ABC

1. Cadastrar pelo menos cinco produtos.
2. Variar demanda e custo.
3. Calcular valor anual de consumo.
4. Interpretar as classes A, B e C.

### Aula 5: sazonalidade

1. Simular demanda estável.
2. Simular pico no fim do ano.
3. Comparar estoque final, ruptura e custo.

### Aula 6: decisão e risco

1. Escolher um desafio.
2. Aplicar uma decisão.
3. Observar benefícios e contrapartidas.
4. Cadastrar um risco associado.
5. Comparar a decisão manual com o otimizador.

---

## 21. Exercícios práticos

### Exercício 1: pontualidade sem completude

- Total de pedidos: 1.000.
- Pedidos no prazo: 980.
- Pedidos no prazo e completos: 900.

**Pergunta:** por que OTD é maior que OTIF?

**Resposta esperada:** mais pedidos chegaram no prazo do que pedidos chegaram simultaneamente no prazo e completos.

### Exercício 2: estoque de segurança

- Demanda média diária: 100.
- Demanda máxima diária: 150.
- Lead time médio: 5 dias.
- Lead time máximo: 8 dias.

```text
Estoque de segurança = 150 × 8 - 100 × 5 = 700 unidades
```

### Exercício 3: risco

- Probabilidade: 3.
- Impacto: 5.

```text
Risco = 3 × 5 = 15
```

O resultado é classificado como alto no simulador.

---

## 22. Checklist antes de concluir uma simulação

- [ ] O período analisado está definido.
- [ ] Os dois cenários usam as mesmas unidades.
- [ ] Não existem erros de consistência.
- [ ] Poucas variáveis foram alteradas por vez.
- [ ] Indicadores de serviço foram analisados.
- [ ] Indicadores de estoque foram analisados.
- [ ] Custos foram analisados.
- [ ] Riscos foram considerados.
- [ ] As premissas foram registradas.
- [ ] O cenário foi salvo ou exportado.
- [ ] A recomendação não foi tratada como decisão automática.

---

## 23. Glossário rápido

| Termo | Significado |
|---|---|
| Acuracidade | Compatibilidade entre estoque físico e registro |
| Curva ABC | Classificação por participação acumulada no valor anual |
| Demanda | Quantidade requerida, consumida ou vendida |
| EOQ ou LEC | Lote Econômico de Compra |
| Fill Rate | Percentual das unidades solicitadas que foram atendidas |
| Giro | Número de vezes que o estoque médio é consumido no período |
| KPI | Indicador-chave de desempenho |
| Lead time | Tempo necessário para concluir um processo |
| OTD | Percentual de pedidos entregues no prazo |
| OTIF | Percentual de pedidos entregues no prazo e completos |
| Ponto de reposição | Nível de estoque que sinaliza nova compra |
| Ruptura | Parte da demanda que não foi atendida |
| Sazonalidade | Variação recorrente da demanda ao longo do tempo |
| SKU | Código individual de identificação de um produto |

---

## 24. Conclusão

O CenariLog Academy evoluiu de um painel de indicadores para um ambiente educacional de simulação, planejamento e apoio à decisão.

A sequência didática do simulador é:

```text
Dados → Indicadores → Comparação → Diagnóstico → Decisão → Risco → Aprendizado
```

O maior valor da ferramenta não está apenas em apresentar resultados. O valor está em permitir que o usuário altere hipóteses, observe consequências, compare alternativas e desenvolva raciocínio logístico.

---

**CenariLog Academy**  
*Aprenda logística simulando indicadores e decisões.*
