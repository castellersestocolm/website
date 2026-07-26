def sanitise(text: str) -> str:
    return text.replace("'", "'").replace('"', '\\"')
