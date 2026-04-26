# Day063 Story — Auto Debit Floor Forecaster

## Why
毎日使う小さな課題を、1ページで即解決できる形にしたかったため。

## Requirements
- Webブラウザだけで完結すること
- 1画面で主要操作が終わること
- GitHub Pagesで公開できること

## Design highlights
- Day063専用にテーマをseed固定して再生成時の見た目を安定化
- productivity用途に寄せた単機能UIで迷いを減らす
- 出力をそのまま再利用できるテキスト構造
- Family: autodebit_floor_forecast
- Mechanic: balance_timeline
- Input/Output: cashflow_rows -> risk_timeline
- Audience Promise: 危ない日を前もって把握できる。
- Publish Hook: 入出金予定を自分で足すと、底割れしそうな日と先に減らす候補が一つのタイムラインで見える。
- Complexity Tier: medium
- Selected components: none
- Complexity hint: Implement the locked brief with one clear hero interaction and keep the main screenshot readable.

## Trade-offs / Known issues
- ローカル保存機能は未実装
- 複雑な入力バリデーションは最小限

## Next ideas
- 履歴保存
- プリセット追加
- エクスポート形式拡張

## Social copy
Day063｜引き落とし底割れ見通し
引き落としで不足しそうな日を見つけやすくするためのツールです。
