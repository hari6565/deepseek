$json = @'
[{"nodeId": "root", "nodeType": "Canvas", "nodeLabel": "", "nodeName": "", "nodeGroupType": "group", "grid": {"classNames": "", "style": {"gridAutoRows": "4px", "columnGap": "0px", "rowGap": "0px"}}, "children": [
  {"nodeId": "g1", "nodeType": "group", "nodeLabel": "customergroup", "nodeName": "customergroup", "nodeParent": "root", "nodeGroupType": "group", "grid": {"classNames": "", "style": {"gridAutoRows": "4px", "columnGap": "0px", "rowGap": "0px"}, "row": {"start": 1, "end": 100}, "column": {"start": 1, "end": 25}}, "children": [
    {"nodeId": "t1", "nodeType": "text", "nodeLabel": "Customer Form", "nodeName": "headline", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 8, "end": 20}, "column": {"start": 2, "end": 24}}},
    {"nodeId": "l1", "nodeType": "label", "nodeLabel": "Name", "nodeName": "namelabel", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 32, "end": 42}, "column": {"start": 2, "end": 10}}},
    {"nodeId": "i1", "nodeType": "textinput", "nodeLabel": "name", "nodeName": "name", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 44, "end": 55}, "column": {"start": 2, "end": 14}}},
    {"nodeId": "l2", "nodeType": "label", "nodeLabel": "Email", "nodeName": "emaillabel", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 67, "end": 77}, "column": {"start": 2, "end": 10}}},
    {"nodeId": "i2", "nodeType": "textinput", "nodeLabel": "email", "nodeName": "email", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 79, "end": 90}, "column": {"start": 2, "end": 14}}},
    {"nodeId": "l3", "nodeType": "label", "nodeLabel": "Phone Number", "nodeName": "phonenumberlabel", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 102, "end": 112}, "column": {"start": 2, "end": 10}}},
    {"nodeId": "i3", "nodeType": "textinput", "nodeLabel": "phonenumber", "nodeName": "phonenumber", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 114, "end": 125}, "column": {"start": 2, "end": 14}}},
    {"nodeId": "b1", "nodeType": "button", "nodeLabel": "save", "nodeName": "save", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 137, "end": 149}, "column": {"start": 2, "end": 6}}},
    {"nodeId": "b2", "nodeType": "button", "nodeLabel": "cancel", "nodeName": "cancel", "nodeParent": "g1", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 137, "end": 149}, "column": {"start": 7, "end": 11}}}
  ]},
  {"nodeId": "g2", "nodeType": "group", "nodeLabel": "customertable", "nodeName": "customertable", "nodeParent": "root", "nodeGroupType": "table", "grid": {"classNames": "", "style": {"gridAutoRows": "4px", "columnGap": "0px", "rowGap": "0px"}, "row": {"start": 175, "end": 300}, "column": {"start": 1, "end": 25}}, "children": [
    {"nodeId": "c1", "nodeType": "column", "nodeLabel": "Name", "nodeName": "name", "nodeParent": "g2", "nodeGroupType": "table", "grid": {"classNames": "", "style": {}, "row": {"start": 1, "end": 2}, "column": {"start": 1, "end": 2}}},
    {"nodeId": "c2", "nodeType": "column", "nodeLabel": "Email", "nodeName": "email", "nodeParent": "g2", "nodeGroupType": "table", "grid": {"classNames": "", "style": {}, "row": {"start": 1, "end": 2}, "column": {"start": 1, "end": 2}}},
    {"nodeId": "c3", "nodeType": "column", "nodeLabel": "Phone Number", "nodeName": "phonenumber", "nodeParent": "g2", "nodeGroupType": "table", "grid": {"classNames": "", "style": {}, "row": {"start": 1, "end": 2}, "column": {"start": 1, "end": 2}}}
  ]},
  {"nodeId": "g3", "nodeType": "group", "nodeLabel": "customerlistgroup", "nodeName": "customerlistgroup", "nodeParent": "root", "nodeGroupType": "group", "grid": {"classNames": "", "style": {"gridAutoRows": "4px", "columnGap": "0px", "rowGap": "0px"}, "row": {"start": 310, "end": 370}, "column": {"start": 1, "end": 25}}, "children": [
    {"nodeId": "lst1", "nodeType": "list", "nodeLabel": "customerlist", "nodeName": "customerlist", "nodeParent": "g3", "nodeGroupType": "group", "grid": {"classNames": "", "style": {}, "row": {"start": 8, "end": 48}, "column": {"start": 2, "end": 24}}}
  ]}
]}
'@

$json = $json.Trim()
try {
    $parsed = $json | ConvertFrom-Json -ErrorAction Stop
    Write-Output "VALID JSON"
    Write-Output "Root children count: $($parsed[0].children.Count)"
} catch {
    Write-Output "INVALID: $_"
}
