# ProGyan AlgoLens - AI Prompt Engineering Strategy

**Version**: 1.0  
**LLM**: OpenAI GPT-4 (Primary), Anthropic Claude (Fallback)  
**Framework**: LangChain  
**Last Updated**: 2024-01-15

---

## Table of Contents

1. [Overview](#overview)
2. [Prompt Templates](#prompt-templates)
3. [Difficulty Levels](#difficulty-levels)
4. [RAG Strategy](#rag-strategy)
5. [Adaptive Learning](#adaptive-learning)
6. [Token Optimization](#token-optimization)
7. [Quality Assurance](#quality-assurance)
8. [Collaborative AI Assistance](#collaborative-ai-assistance)

---

## Overview

The AI explanation system uses carefully engineered prompts to generate contextual, adaptive explanations for code execution steps. The strategy focuses on:
- **Clarity**: Explanations must be clear and unambiguous
- **Relevance**: Context-aware based on execution state
- **Adaptability**: Adjusted to learner's level
- **Consistency**: Structured format for all explanations
- **Efficiency**: Optimized token usage

---

## Prompt Templates

### Base Template Structure

All prompts follow this structure:

```
[SYSTEM CONTEXT]
[ROLE DEFINITION]
[EXECUTION CONTEXT]
[LEARNER PROFILE]
[TASK INSTRUCTIONS]
[OUTPUT FORMAT]
[CONSTRAINTS]
```

---

### Template 1: Step Explanation

**Purpose**: Explain what happens in a single execution step

```python
STEP_EXPLANATION_TEMPLATE = """
You are an expert programming tutor explaining code execution step-by-step.

ROLE:
- Explain code execution clearly and accurately
- Adapt explanations to student's level: {difficulty_level}
- Focus on understanding, not just mechanics
- Use analogies when helpful

EXECUTION CONTEXT:
- Algorithm: {algorithm_name}
- Language: {language}
- Current Line: {line_number}
- Code: `{code_line}`
- Previous Line: `{previous_line}`

CURRENT STATE:
Variables:
{variables_json}

Stack:
{stack_json}

Memory Changes:
{memory_changes}

LEARNER PROFILE:
- Level: {difficulty_level}
- Concepts Understood: {understood_concepts}
- Concepts Struggling: {struggling_concepts}
- Learning Pace: {learning_pace}

TASK:
Explain this execution step in exactly 4 parts:

1. WHAT: What is happening in this step? (1-2 sentences)
2. WHY: Why is this step important? (1-2 sentences)
3. HOW: How does this step work technically? (2-3 sentences)
4. IMPACT: What impact does this have on the overall execution? (1-2 sentences)

OUTPUT FORMAT (JSON):
{{
  "what": "...",
  "why": "...",
  "how": "...",
  "impact": "...",
  "concepts": ["concept1", "concept2"],
  "difficulty_appropriate": true
}}

CONSTRAINTS:
- Keep each section concise
- Use {difficulty_level}-appropriate language
- Highlight key concepts
- Avoid jargon unless {difficulty_level} is "advanced"
- Include code references using backticks
- Be encouraging and supportive
"""
```

**Example Usage:**

```python
prompt = STEP_EXPLANATION_TEMPLATE.format(
    difficulty_level="intermediate",
    algorithm_name="Bubble Sort",
    language="python",
    line_number=5,
    code_line="if arr[j] > arr[j+1]:",
    previous_line="for j in range(0, n-i-1):",
    variables_json=json.dumps({
        "arr": [64, 34, 25, 12, 22],
        "n": 5,
        "i": 0,
        "j": 2
    }, indent=2),
    stack_json=json.dumps([
        {"function": "bubble_sort", "line": 5}
    ], indent=2),
    memory_changes="arr[2] and arr[3] will be compared",
    understood_concepts=["loops", "arrays"],
    struggling_concepts=["comparison operators"],
    learning_pace="medium"
)
```

**Expected Output:**

```json
{
  "what": "We're comparing arr[2] (value 25) with arr[3] (value 12) to check if they're in the wrong order.",
  "why": "This comparison determines whether we need to swap these two elements to move larger values toward the end of the array.",
  "how": "The > operator checks if the left value (25) is greater than the right value (12). Since 25 > 12 is true, the condition is satisfied and we'll enter the if block.",
  "impact": "Because the condition is true, the next step will swap these elements, moving 12 before 25, which brings us one step closer to a sorted array.",
  "concepts": ["comparison", "conditional", "array_indexing", "sorting"],
  "difficulty_appropriate": true
}
```

---

### Template 2: Concept Explanation

**Purpose**: Explain programming concepts in depth

```python
CONCEPT_EXPLANATION_TEMPLATE = """
You are a programming concepts tutor.

CONCEPT: {concept_name}
CONTEXT: Explaining in the context of {algorithm_name}
STUDENT LEVEL: {difficulty_level}

TASK:
Provide a comprehensive explanation of "{concept_name}" that includes:

1. DEFINITION: Clear, concise definition (1-2 sentences)
2. PURPOSE: Why this concept exists and when to use it (2-3 sentences)
3. EXAMPLE: Simple code example demonstrating the concept
4. COMMON MISTAKES: 2-3 common mistakes beginners make
5. RELATED CONCEPTS: List 3-5 related concepts to explore

Keep the explanation at {difficulty_level} level.

OUTPUT FORMAT (JSON):
{{
  "definition": "...",
  "purpose": "...",
  "example": "...",
  "common_mistakes": ["...", "..."],
  "related_concepts": ["...", "..."]
}}
"""
```

---

### Template 3: Error Explanation

**Purpose**: Explain errors and suggest fixes

```python
ERROR_EXPLANATION_TEMPLATE = """
You are a debugging assistant helping a {difficulty_level} programmer.

ERROR DETAILS:
- Type: {error_type}
- Message: {error_message}
- Line: {error_line}
- Code: `{error_code}`

CONTEXT:
- Algorithm: {algorithm_name}
- What the code was trying to do: {intended_behavior}

TASK:
Explain this error and help fix it:

1. WHAT HAPPENED: Explain the error in simple terms
2. WHY IT HAPPENED: Root cause of the error
3. HOW TO FIX: Step-by-step fix instructions
4. PREVENTION: How to avoid this error in the future

Be supportive and educational. Don't just give the answer.

OUTPUT FORMAT (JSON):
{{
  "what_happened": "...",
  "why_it_happened": "...",
  "how_to_fix": ["step1", "step2", "step3"],
  "prevention": "...",
  "learning_opportunity": "..."
}}
"""
```

---

## Difficulty Levels

### Beginner Level

**Characteristics:**
- Simple language, no jargon
- Detailed explanations
- Analogies and real-world examples
- Encouraging tone
- Step-by-step breakdowns

**Prompt Modifiers:**
```python
BEGINNER_MODIFIERS = """
LANGUAGE GUIDELINES:
- Use everyday language
- Explain technical terms when used
- Provide analogies (e.g., "like sorting books on a shelf")
- Break complex ideas into simple steps
- Be patient and encouraging

AVOID:
- Technical jargon without explanation
- Assuming prior knowledge
- Complex terminology
- Rushing through concepts
"""
```

**Example:**
```
Instead of: "The comparison operator evaluates the boolean expression"
Use: "We're checking if one number is bigger than another, which gives us a yes or no answer"
```

---

### Intermediate Level

**Characteristics:**
- Technical terms with brief explanations
- Focus on understanding patterns
- Some assumed knowledge
- Balanced detail level

**Prompt Modifiers:**
```python
INTERMEDIATE_MODIFIERS = """
LANGUAGE GUIDELINES:
- Use technical terms with brief context
- Explain the "why" behind patterns
- Connect to broader programming concepts
- Assume basic programming knowledge
- Encourage deeper thinking

FOCUS ON:
- Patterns and best practices
- Efficiency considerations
- Common use cases
- Connections between concepts
"""
```

---

### Advanced Level

**Characteristics:**
- Technical precision
- Performance implications
- Design patterns
- Optimization opportunities
- Minimal hand-holding

**Prompt Modifiers:**
```python
ADVANCED_MODIFIERS = """
LANGUAGE GUIDELINES:
- Use precise technical terminology
- Discuss time/space complexity
- Mention optimization opportunities
- Reference design patterns
- Assume strong programming foundation

INCLUDE:
- Big O analysis
- Memory layout details
- Performance implications
- Alternative approaches
- Edge cases and trade-offs
"""
```

---

## RAG Strategy

### Knowledge Base Structure

```
algorithms/
├── sorting/
│   ├── bubble_sort.md
│   ├── quick_sort.md
│   └── merge_sort.md
├── searching/
│   ├── binary_search.md
│   └── linear_search.md
├── data_structures/
│   ├── arrays.md
│   ├── linked_lists.md
│   └── trees.md
└── concepts/
    ├── time_complexity.md
    ├── space_complexity.md
    └── recursion.md
```

### Document Format

```markdown
# Bubble Sort

## Overview
Bubble sort is a simple sorting algorithm that repeatedly steps through the list...

## Time Complexity
- Best Case: O(n) - when array is already sorted
- Average Case: O(n²)
- Worst Case: O(n²)

## Space Complexity
O(1) - sorts in place

## Key Concepts
- Comparison-based sorting
- In-place algorithm
- Stable sort

## Common Patterns
1. Nested loops for comparisons
2. Swap adjacent elements
3. Optimization: early termination

## Use Cases
- Small datasets (< 50 elements)
- Nearly sorted data
- Educational purposes
- When simplicity is priority

## Common Mistakes
1. Forgetting to reduce inner loop range
2. Not optimizing for already sorted arrays
3. Incorrect swap logic
```

### Retrieval Strategy

```python
def retrieve_context(execution_step, k=3):
    """
    Retrieve relevant context for explanation generation
    """
    # Build query from execution context
    query = f"""
    {execution_step.algorithm_name}
    {execution_step.code_line}
    {' '.join(execution_step.concepts)}
    """
    
    # Retrieve from vector store
    docs = vectorstore.similarity_search(
        query=query,
        k=k,
        filter={"type": "algorithm_knowledge"}
    )
    
    # Combine retrieved context
    context = "\n\n".join([doc.page_content for doc in docs])
    
    return context
```

### Context Injection

```python
PROMPT_WITH_RAG = """
{base_prompt}

RELEVANT KNOWLEDGE:
{retrieved_context}

Use this knowledge to enhance your explanation, but adapt it to the student's level.
"""
```

---

## Adaptive Learning

### Learner Profile Schema

```python
class LearnerProfile:
    difficulty_score: float  # 0.0 (beginner) to 1.0 (advanced)
    concept_understanding: Dict[str, float]  # concept -> mastery (0-1)
    learning_pace: str  # "slow", "medium", "fast"
    preferred_style: str  # "visual", "textual", "example-based"
    feedback_history: List[Feedback]
```

### Difficulty Adjustment Algorithm

```python
def adjust_difficulty(profile: LearnerProfile, feedback: Feedback):
    """
    Adjust difficulty based on user feedback
    """
    if feedback.too_simple:
        profile.difficulty_score += 0.1
    elif feedback.too_complex:
        profile.difficulty_score -= 0.1
    
    # Clamp between 0 and 1
    profile.difficulty_score = max(0.0, min(1.0, profile.difficulty_score))
    
    # Update concept understanding
    for concept in feedback.concepts:
        if feedback.helpful:
            profile.concept_understanding[concept] = min(
                1.0,
                profile.concept_understanding.get(concept, 0.5) + 0.1
            )
        else:
            profile.concept_understanding[concept] = max(
                0.0,
                profile.concept_understanding.get(concept, 0.5) - 0.05
            )
    
    return profile

def get_difficulty_level(score: float) -> str:
    """
    Convert difficulty score to level
    """
    if score < 0.33:
        return "beginner"
    elif score < 0.67:
        return "intermediate"
    else:
        return "advanced"
```

### Adaptive Prompt Selection

```python
def build_adaptive_prompt(execution_step, learner_profile):
    """
    Build prompt adapted to learner's profile
    """
    difficulty = get_difficulty_level(learner_profile.difficulty_score)
    
    # Select base template
    template = STEP_EXPLANATION_TEMPLATE
    
    # Add difficulty-specific modifiers
    if difficulty == "beginner":
        template += BEGINNER_MODIFIERS
    elif difficulty == "intermediate":
        template += INTERMEDIATE_MODIFIERS
    else:
        template += ADVANCED_MODIFIERS
    
    # Identify struggling concepts
    struggling = [
        concept for concept, mastery in learner_profile.concept_understanding.items()
        if mastery < 0.5
    ]
    
    # Add extra guidance for struggling concepts
    if any(concept in execution_step.concepts for concept in struggling):
        template += """
        
EXTRA GUIDANCE:
The student is still learning: {struggling_concepts}
Provide additional explanation and examples for these concepts.
"""
    
    return template.format(
        difficulty_level=difficulty,
        struggling_concepts=", ".join(struggling),
        **execution_step.to_dict()
    )
```

---

## Token Optimization

### Strategies

1. **Prompt Compression**
```python
def compress_state(state: dict) -> str:
    """
    Compress execution state to reduce tokens
    """
    # Only include changed variables
    relevant_vars = {
        k: v for k, v in state['variables'].items()
        if k in state['changed_variables']
    }
    
    # Truncate large data structures
    for key, value in relevant_vars.items():
        if isinstance(value, list) and len(value) > 10:
            relevant_vars[key] = value[:5] + ['...'] + value[-5:]
    
    return json.dumps(relevant_vars, indent=2)
```

2. **Response Caching**
```python
def get_cached_explanation(context_hash: str) -> Optional[str]:
    """
    Check cache before generating new explanation
    """
    cached = redis.get(f"explanation:{context_hash}")
    if cached:
        return json.loads(cached)
    return None

def cache_explanation(context_hash: str, explanation: dict):
    """
    Cache explanation for 24 hours
    """
    redis.setex(
        f"explanation:{context_hash}",
        86400,  # 24 hours
        json.dumps(explanation)
    )
```

3. **Batch Processing**
```python
async def generate_explanations_batch(steps: List[ExecutionStep]):
    """
    Generate multiple explanations in one API call
    """
    prompts = [build_prompt(step) for step in steps]
    
    # Use GPT-4 batch API
    responses = await openai.ChatCompletion.acreate(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt} for prompt in prompts],
        max_tokens=500 * len(prompts)
    )
    
    return [parse_response(r) for r in responses]
```

### Token Budget

```python
TOKEN_LIMITS = {
    "prompt": 2000,      # Max tokens for prompt
    "response": 500,     # Max tokens for response
    "context": 1000,     # Max tokens for RAG context
    "total": 3500        # Total per request
}

def enforce_token_limit(prompt: str, max_tokens: int) -> str:
    """
    Truncate prompt if it exceeds token limit
    """
    tokens = count_tokens(prompt)
    if tokens > max_tokens:
        # Truncate context, keep instructions
        parts = prompt.split("EXECUTION CONTEXT:")
        context = parts[1].split("TASK:")[0]
        
        # Truncate context
        truncated_context = truncate_to_tokens(context, max_tokens - 1000)
        
        prompt = parts[0] + "EXECUTION CONTEXT:" + truncated_context + "TASK:" + parts[1].split("TASK:")[1]
    
    return prompt
```

---

## Quality Assurance

### Validation Rules

```python
def validate_explanation(explanation: dict) -> bool:
    """
    Validate explanation meets quality standards
    """
    checks = [
        # Required fields present
        all(key in explanation for key in ["what", "why", "how", "impact"]),
        
        # Reasonable length (not too short or too long)
        50 < len(explanation["what"]) < 300,
        50 < len(explanation["why"]) < 300,
        100 < len(explanation["how"]) < 500,
        50 < len(explanation["impact"]) < 300,
        
        # Concepts identified
        len(explanation.get("concepts", [])) > 0,
        
        # No placeholder text
        "..." not in explanation["what"],
        "TODO" not in str(explanation),
        
        # Appropriate difficulty
        explanation.get("difficulty_appropriate", False)
    ]
    
    return all(checks)
```

### Fallback Strategy

```python
async def generate_explanation_with_fallback(context):
    """
    Try primary LLM, fall back to secondary if needed
    """
    try:
        # Try OpenAI GPT-4
        explanation = await generate_with_openai(context)
        if validate_explanation(explanation):
            return explanation
    except Exception as e:
        logger.warning(f"OpenAI failed: {e}")
    
    try:
        # Fallback to Anthropic Claude
        explanation = await generate_with_anthropic(context)
        if validate_explanation(explanation):
            return explanation
    except Exception as e:
        logger.error(f"Anthropic failed: {e}")
    
    # Last resort: template-based explanation
    return generate_template_explanation(context)
```

### A/B Testing

```python
def ab_test_prompts(user_id: str, context: dict):
    """
    A/B test different prompt variations
    """
    variant = hash(user_id) % 2
    
    if variant == 0:
        prompt = PROMPT_VARIANT_A.format(**context)
    else:
        prompt = PROMPT_VARIANT_B.format(**context)
    
    # Track which variant was used
    analytics.track("prompt_variant", {
        "user_id": user_id,
        "variant": "A" if variant == 0 else "B"
    })
    
    return prompt
```

---

## Monitoring and Metrics

### Key Metrics

```python
METRICS_TO_TRACK = {
    "generation_time_ms": "Time to generate explanation",
    "tokens_used": "Total tokens consumed",
    "cache_hit_rate": "Percentage of cached responses",
    "validation_pass_rate": "Percentage passing validation",
    "user_satisfaction": "Helpful feedback percentage",
    "difficulty_accuracy": "Appropriate difficulty percentage"
}
```

### Logging

```python
def log_explanation_generation(context, explanation, metrics):
    """
    Log explanation generation for analysis
    """
    logger.info("Explanation generated", extra={
        "session_id": context["session_id"],
        "step_number": context["step_number"],
        "difficulty_level": context["difficulty_level"],
        "tokens_used": metrics["tokens_used"],
        "generation_time_ms": metrics["generation_time_ms"],
        "cached": metrics["cached"],
        "validation_passed": validate_explanation(explanation)
    })
```

---

## Best Practices

1. **Always validate explanations** before sending to users
2. **Cache aggressively** to reduce costs and latency
3. **Monitor token usage** to stay within budget
4. **Collect feedback** to improve prompts over time
5. **A/B test** prompt variations to optimize quality
6. **Use RAG** to ground explanations in factual knowledge
7. **Adapt to learner** based on their profile and feedback
8. **Provide fallbacks** for when primary LLM fails
9. **Keep prompts versioned** for reproducibility
10. **Measure and optimize** continuously

---

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Maintained by**: AI/ML Team

---

## Collaborative AI Assistance

### Purpose
Support multiple users collaborating on the same algorithm with context-aware suggestions and conflict resolution explanations.

### Collaborative Context Template
```python
COLLABORATIVE_ASSISTANCE_TEMPLATE = """
You are a collaborative programming assistant helping a group of developers.

COLLABORATION CONTEXT:
- Users involved: {user_list}
- Recent changes by: {last_modifier}
- Shared algorithm: {algorithm_name}

TASK:
1. Explain the recent changes made by {last_modifier} to the other collaborators.
2. Suggest 2-3 collaborative tasks (e.g., "User B could implement the partition logic while User A works on the main recursion").
3. Resolve any logic conflicts or performance concerns in the combined code.

OUTPUT FORMAT (JSON):
{{
  "change_summary": "...",
  "collaboration_suggestions": ["...", "..."],
  "conflict_resolution": "..."
}}
"""
```