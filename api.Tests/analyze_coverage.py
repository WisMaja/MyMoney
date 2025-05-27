import xml.etree.ElementTree as ET
import sys

# Parse the coverage report
tree = ET.parse('TestResults/2049606c-512b-4fbd-84e0-530acadb64bf/coverage.cobertura.xml')
root = tree.getroot()

# Get overall coverage
line_rate = float(root.get('line-rate'))
branch_rate = float(root.get('branch-rate'))
lines_covered = int(root.get('lines-covered'))
lines_valid = int(root.get('lines-valid'))
branches_covered = int(root.get('branches-covered'))
branches_valid = int(root.get('branches-valid'))

print('=== POKRYCIE KODU - MyMoney API ===')
print()
print(f'📊 OGÓLNE STATYSTYKI:')
print(f'   • Pokrycie linii: {line_rate:.1%} ({lines_covered}/{lines_valid} linii)')
print(f'   • Pokrycie gałęzi: {branch_rate:.1%} ({branches_covered}/{branches_valid} gałęzi)')
print()

# Analyze by class
print('📁 POKRYCIE WEDŁUG KOMPONENTÓW:')
print()

controllers = []
services = []
models = []
other = []

for package in root.findall('.//package'):
    for cls in package.findall('classes/class'):
        name = cls.get('name')
        filename = cls.get('filename')
        cls_line_rate = float(cls.get('line-rate'))
        cls_branch_rate = float(cls.get('branch-rate'))
        
        if 'Controller' in name:
            controllers.append((name, filename, cls_line_rate, cls_branch_rate))
        elif 'Service' in name:
            services.append((name, filename, cls_line_rate, cls_branch_rate))
        elif 'Models' in filename:
            models.append((name, filename, cls_line_rate, cls_branch_rate))
        else:
            other.append((name, filename, cls_line_rate, cls_branch_rate))

def print_category(title, items):
    if not items:
        return
    print(f'{title}:')
    for name, filename, line_rate, branch_rate in sorted(items):
        short_name = name.split('.')[-1] if '.' in name else name
        if '<' in short_name:  # Skip async state machine classes
            continue
        print(f'   • {short_name:<30} {line_rate:>6.1%} linii, {branch_rate:>6.1%} gałęzi')
    print()

print_category('🎮 KONTROLERY', controllers)
print_category('⚙️  SERWISY', services)
print_category('📦 MODELE', models)

# Summary by tested vs untested
tested_controllers = [c for c in controllers if c[2] > 0]
untested_controllers = [c for c in controllers if c[2] == 0]

print('📈 PODSUMOWANIE TESTÓW:')
print(f'   • Testowane kontrolery: {len(tested_controllers)}')
print(f'   • Nietestowane kontrolery: {len(untested_controllers)}')
print()

if untested_controllers:
    print('❌ KONTROLERY BEZ TESTÓW:')
    for name, filename, line_rate, branch_rate in untested_controllers:
        short_name = name.split('.')[-1] if '.' in name else name
        if '<' not in short_name:  # Skip async state machine classes
            print(f'   • {short_name}')
    print()

print('✅ KONTROLERY Z TESTAMI:')
for name, filename, line_rate, branch_rate in tested_controllers:
    short_name = name.split('.')[-1] if '.' in name else name
    if '<' not in short_name:  # Skip async state machine classes
        print(f'   • {short_name} - {line_rate:.1%} pokrycia') 