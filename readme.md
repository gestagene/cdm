# CDM

A mobile app built with React Native, Expo, and Expo Router.

## Getting Started

### Requirements

- Node.js
- Git
- Expo Go app on your phone, or an Android/iOS emulator

### Setup

```bash
git clone https://github.com/gestagene/cdm.git
cd cdm
npm install
npx expo start
```

Scan the QR code with Expo Go to open the app on your phone. Your phone and computer must be on the same Wi-Fi network.

## Project Structure

```
src/
    app/            # Screens and navigation
        _layout.tsx # Root layout
        (tabs)/     # Tab screens
    components/     # Reusable UI pieces (Header, Button, Card, etc.)
    hooks/          # Custom React hooks
    services/       # API calls
    constants/      # Colors, etc.
    types/          # Shared types
```

## Rules of Thumb

- Only screens go inside `src/app`.
- Use colors, spacing, etc. from `constants/` instead of hardcoding them, for consistency.
- Build reusable components first, then build screens from them.
- Use mock data in place of real data until integration.

## Git Workflow

1. Never commit directly to `main`.
2. Get the latest code before starting:

   ```bash
   git switch main
   git pull
   ```

3. Create a branch for your task:

   ```bash
   git checkout -b feature/home
   ```

4. Commit your work with a clear message:

   ```bash
   git add .
   git commit -m "feat: add home screen"
   ```

5. Push your branch and open a pull request on GitHub:

   ```bash
   git push -u origin feature/home
   ```

6. Wait for review.

## Commit Messages

- `feat:` new feature
- `fix:` bug fix
- `style:` UI/styling
- `docs:` documentation
- `chore:` setup/maintenance
