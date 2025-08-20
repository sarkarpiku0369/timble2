# This file contains documentation regarding the fonts used in the project, including how to add or use custom fonts.

## Fonts Used in the Project

This project utilizes custom fonts to enhance the visual appeal of the application. Below are the steps to add or use custom fonts in your React Native project.

### Adding Custom Fonts

1. **Add Font Files**: Place your font files (e.g., `.ttf`, `.otf`) in the `src/assets/fonts` directory.

2. **Link Fonts**: If you are using React Native CLI, you may need to link the fonts. Run the following command:
   ```
   npx react-native link
   ```

3. **Update `react-native.config.js`**: Ensure that your `react-native.config.js` file includes the fonts directory:
   ```javascript
   module.exports = {
     assets: ['./src/assets/fonts'],
   };
   ```

### Using Fonts in Your Components

To use the custom fonts in your components, you can specify the font family in your styles. For example:
```javascript
const styles = StyleSheet.create({
  text: {
    fontFamily: 'YourCustomFontName',
    fontSize: 16,
  },
});
```

### Note

Make sure to replace `YourCustomFontName` with the actual name of the font as defined in the font file. You can find the font name by opening the font file on your computer.

### Conclusion

By following these steps, you can easily add and use custom fonts in your React Native application to create a unique and engaging user experience.