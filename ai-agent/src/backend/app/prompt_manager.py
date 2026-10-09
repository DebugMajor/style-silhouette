import os
import yaml
from typing import Any

url_template = "farrosalferro/{agent}-prompt:latest"


class PromptManager:

    def __init__(self, auto_load: bool = True):
        self._prompts: dict[str, Any] = {}
        if auto_load:
            self.load_all()

    def load_all(self) -> None:
        prompts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "prompts"))
        for agent in ["agent", "descriptor", "recommender", "vton"]:
            yaml_path = os.path.join(prompts_dir, f"{agent}.yaml")
            if os.path.exists(yaml_path):
                try:
                    with open(yaml_path, "r", encoding="utf-8") as f:
                        data = yaml.safe_load(f)
                        self._prompts[agent] = data.get("prompt", "")
                except Exception:
                    pass

        api_key = os.getenv("LANGSMITH_API_KEY")
        if api_key and os.getenv("LANGSMITH_TRACING", "false").lower() == "true":
            try:
                from langsmith import Client
                client = Client(api_key=api_key)
                for agent in ["agent", "descriptor", "recommender", "vton"]:
                    p = client.pull_prompt(url_template.format(agent=agent))
                    self._prompts[agent] = p
            except Exception:
                pass

    def get_prompt(self, agent: str) -> str:
        prompt = self._prompts.get(agent)
        if isinstance(prompt, str):
            return prompt
        if prompt is not None:
            try:
                return prompt.messages[0].prompt.template
            except Exception:
                pass
        return f"Generate virtual try-on for {agent}"

    def refresh(self, name: str = None) -> None:
        self.load_all()

