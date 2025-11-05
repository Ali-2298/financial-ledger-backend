```graph TD
    A["📘 Financial Ledger Dashboard<br/>GET /ledger<br/><br/>User sees:<br/>• List of all ledger accounts<br/>• Account names & balances<br/>• Total debits/credits summary<br/>• Add New Transaction button<br/>• Search/filter options (by date, account, type)"]

    B["📄 Account Details Page<br/>GET /ledger/:accountId<br/><br/>User sees:<br/>• Account name & type<br/>• Transaction history (Date, Description, Debit, Credit, Balance)<br/>• Running total balance<br/>• Edit/Delete transaction options<br/>• Add Adjustment button"]

    E["➕ Add New Transaction Form<br/>POST /transactions<br/><br/>Form fields:<br/>• Account (dropdown)<br/>• Date<br/>• Description<br/>• Debit (number, min: 0)<br/>• Credit (number, min: 0)<br/>• Save/Cancel buttons"]

    F["✏️ Edit Transaction Form<br/>PUT /transactions/:id<br/><br/>Pre-filled form:<br/>• Current account, date, and details<br/>• Editable debit/credit fields<br/>• Update/Delete/Cancel buttons"]

    I["🗑️ Delete Confirmation<br/>DELETE /transactions/:id<br/><br/>User sees:<br/>• Confirmation message<br/>• Transaction summary<br/>• Confirm/Cancel buttons<br/>• Warning about data loss"]

    %% Main navigation flow
    A -->|"Click account"| B

    %% Create actions
    A -->|"Add New Transaction"| E
    E -->|"Save successful"| A
    E -->|"Cancel"| A

    %% Edit/Delete transaction actions
    B -->|"Edit Transaction"| F
    F -->|"Update successful"| B
    F -->|"Cancel"| B
    B -->|"Delete Transaction"| I
    I -->|"Confirm delete"| A
    I -->|"Cancel"| B
    F -->|"Delete from edit"| I

    %% Back navigation
    B -->|"Back to dashboard"| A

    %% Styling
    classDef primaryPage fill:#e8f5e8,stroke:#27ae60,stroke-width:3px
    classDef formPage fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef deletePage fill:#f8d7da,stroke:#dc3545,stroke-width:2px

    class A,B primaryPage
    class E,F formPage
    class I deletePage
