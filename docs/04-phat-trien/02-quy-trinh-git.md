# 02 — Quy trình Git

> **Vai trò đọc**: dev — biết branch/commit/PR convention của Vivu.

---

## 1. Branch strategy — trunk-based với short-lived feature branches

```
main (protected, deploy production)
  │
  ├── develop (deploy staging, optional Phase 1.5+)
  │
  ├── feat/sprint4-booking-flow      (1 feature, ≤1 tuần)
  ├── feat/sprint3-search-autocomplete
  ├── fix/booking-payment-deadline
  └── chore/upgrade-nextjs-15
```

**Phase 1**: dùng `main` + feature branches (không cần `develop`). Mỗi PR merge thẳng vào `main` → auto deploy Vercel production sau staging xanh.

**Phase 1.5+**: cân nhắc thêm `develop` khi team ≥5 dev.

---

## 2. Branch naming

| Prefix | Loại | Ví dụ |
| --- | --- | --- |
| `feat/` | Feature mới | `feat/sprint4-booking-flow` |
| `fix/` | Bug fix | `fix/booking-payment-webhook-idempotency` |
| `chore/` | Maintenance | `chore/upgrade-prisma-v5` |
| `refactor/` | Refactor không đổi behavior | `refactor/service-layer-split-large-files` |
| `docs/` | Doc only | `docs/add-adr-005-seo-polymorphic` |
| `test/` | Test only | `test/booking-service-integration` |
| `migration/` | DB migration | `migration/add-pricing-options-allotment` |

Format: `<prefix>/<sprint-or-context>-<short-desc>`. Tất cả kebab-case, English.

---

## 3. Commit message

### Format

```
<type>(<scope>): <short summary>

<body — optional, explain WHY>

<footer — optional, ticket/refs>
```

### Type (cùng prefix branch + thêm)

- `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `migration`
- `perf` — performance tuning
- `style` — formatting only (không đổi code)

### Ví dụ

```
feat(booking): add pessimistic lock on TourDeparture.bookedCount

Lock departure row in Serializable transaction to prevent overbook race.
Adds DepartureFullError when bookedCount + participants > max.

Refs: SPR4-12, ADR-002
```

```
fix(payment): handle VNPay webhook duplicate calls

Webhook can be retried by VNPay → check Payment.status before update.

Closes: #45
```

```
migration(schema): add @db.Uuid to all ID columns

ALTER TYPE TEXT → UUID for 16 tables + 18 FK columns.
Pre-flight audit verifies UUID format before ALTER.

Refs: ADR-003, R-13
```

### Rules

- Imperative mood ("add", not "added" or "adds")
- Subject line ≤ 72 chars
- Lowercase đầu (trừ proper nouns)
- Không kết `.`
- Body wrap 72 chars
- English (team Vivu mix dev VN + handover future có thể quốc tế)

---

## 4. PR (Pull Request)

### 4.1 Template

```markdown
## Mục tiêu
<1-2 câu mô tả WHY>

## Thay đổi
- [ ] ...
- [ ] ...

## Trace
- Sprint task: SPR4-XX
- ADR (nếu có): ADR-XXX
- Business rule (nếu có): BR-XX

## Test plan
- [ ] Unit tests pass (lệnh nào)
- [ ] Manual test happy path
- [ ] Manual test edge case

## Migration (nếu có)
- [ ] Pre-flight audit pass
- [ ] Rollback plan có trong doc

## Checklist
- [ ] Lint pass (`pnpm lint`)
- [ ] Type check pass (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test`)
- [ ] Doc updated (file nào)
- [ ] Self-reviewed diff
- [ ] Screenshot UI (nếu có)
```

### 4.2 Quy mô PR

- **Recommended**: ≤500 dòng diff
- **Max**: 1000 dòng diff
- > 1000 dòng → tách thành nhiều PR (xem skill `split-to-prs`)

### 4.3 Review

- ≥1 approver (Tech Lead cho schema/migration/service core)
- 2 approvers cho ADR mới
- Self-review trước khi assign reviewer

### 4.4 Merge strategy

- **Squash merge** (default) — giữ history `main` sạch
- **Rebase merge** — khi muốn giữ từng commit (hiếm dùng)
- **Không** merge commit (tránh diamond pattern)

---

## 5. Sprint workflow

```
Sprint planning (đầu sprint)
  → Backlog → Tasks → Branch + PR

Trong sprint:
  → Daily standup (15 phút)
  → Code → PR → Review → Merge
  → Update sprint doc nếu scope đổi

End of sprint:
  → Sprint close checklist
  → Retro
  → Update changelog
```

→ Sprint docs: `../05-quan-ly-sprint/`.

---

## 6. Hotfix workflow

```
Bug critical phát hiện ở production
  → Branch `hotfix/<short-desc>` từ main
  → Fix + test local
  → PR → ≥2 approvers (gồm Tech Lead)
  → Merge → auto deploy
  → Post-mortem note vào changelog nếu impact lớn
```

---

## 7. Code review checklist

### Reviewer kiểm

- [ ] Logic đúng business rule (BR-XX trace)
- [ ] Service layer pattern (không page gọi Prisma)
- [ ] Error handling (DomainError class, không throw string)
- [ ] Validation Zod ở boundary
- [ ] Test cover happy + edge case
- [ ] DB migration có audit + rollback (nếu có)
- [ ] No `console.log` còn sót lại
- [ ] No `any`/`as any` ngoại lệ
- [ ] Doc cập nhật (nếu thay đổi public API hoặc business rule)

### Author tự kiểm trước khi assign

- [ ] Run `pnpm lint && pnpm typecheck && pnpm test`
- [ ] Self-review diff trên GitHub
- [ ] Branch up-to-date với main
- [ ] PR description đầy đủ

---

## 8. Conflict resolution

- Tôn trọng PR sớm hơn — nếu conflict → rebase branch mình lên main
- `git rebase main` ưu tiên hơn `git merge main` (history sạch)
- Sau rebase: `git push --force-with-lease` (an toàn hơn `--force`)

---

## 9. Git hooks (Husky)

```bash
# .husky/pre-commit
pnpm lint-staged   # ESLint + Prettier on staged files

# .husky/commit-msg
pnpm commitlint --edit $1   # Verify commit message format
```

→ Setup: xem `travel-web/README.md`.

---

## 10. Bảo vệ secret

- KHÔNG commit `.env` (đã trong `.gitignore`)
- KHÔNG commit credentials vào code
- KHÔNG paste production URL/key vào PR description
- Lỡ commit secret → rotate ngay + `git filter-repo` cleanup history

---

## Liên kết

- Quy chuẩn code: `01-quy-chuan-lap-trinh.md`
- Testing: `03-testing.md`
- Bảo mật: `04-bao-mat-xac-thuc.md`
- Skill split-to-prs: (Cursor skill, không phải doc)
