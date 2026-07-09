import difflib
import os

files = [
    ('src/app/overview/page.tsx', 'recovery/page.tsx_earliest.txt'),
    ('src/features/overview/SummaryCards.tsx', 'recovery/summarycards.tsx_earliest.txt'),
    ('src/features/overview/TrainComposition.tsx', 'recovery/traincomposition.tsx_earliest.txt'),
    ('src/features/overview/TrainPositionMap.tsx', 'recovery/trainpositionmap.tsx_earliest.txt'),
    ('src/features/overview/ActiveAlarmTable.tsx', 'recovery/activealarmtable.tsx_earliest.txt'),
    ('src/features/overview/PredictiveMaintenancePanel.tsx', 'recovery/predictivemaintenancepanel.tsx_earliest.txt'),
    ('src/features/overview/InteractiveTrainsetPanel.tsx', 'recovery/interactivetrainsetpanel.tsx_earliest.txt')
]

for current, earliest in files:
    print(f'\n--- {current} vs {earliest} ---')
    if not os.path.exists(current):
        print(f'Current file {current} not found.')
        continue
    if not os.path.exists(earliest):
        print(f'Earliest backup {earliest} not found.')
        continue
        
    with open(current, 'r', encoding='utf-8') as f:
        curr_lines = f.readlines()
    with open(earliest, 'r', encoding='utf-8') as f:
        earliest_lines = f.readlines()
        
    diff = list(difflib.unified_diff(earliest_lines, curr_lines, fromfile='earliest', tofile='current', n=0))
    if not diff:
        print('IDENTICAL')
    else:
        print(''.join(diff[:10]))
        if len(diff) > 10:
            print(f'... and {len(diff) - 10} more lines')
