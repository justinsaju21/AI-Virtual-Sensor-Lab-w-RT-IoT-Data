
with open('learning/file_structure_explanation.tex', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if line.count('{') != line.count('}'):
            print(f'Line {i}: Open={line.count("{")}, Close={line.count("}")}: {line.strip()}')
