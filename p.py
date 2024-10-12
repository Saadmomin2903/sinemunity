import os

def copy_folder_structure_as_text(root_dir):
    folder_structure = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Add folder name (including subfolders)
        folder_structure.append(f"Folder: {dirpath}")
        
        # For each file in the folder, add file name and its content
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            folder_structure.append(f"File: {filename}")
            
            # Read and add file content
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    folder_structure.append(f"Content:\n{content}\n")
            except Exception as e:
                folder_structure.append(f"Could not read file: {file_path}, Error: {str(e)}")

        folder_structure.append("\n")  # Add a new line for better readability

    return "\n".join(folder_structure)

# Specify the root directory of the folder you want to copy
root_dir = '/Users/saadmomin/mm'
folder_text = copy_folder_structure_as_text(root_dir)

# Output to a text file (if needed)
with open('folder_structure.txt', 'w', encoding='utf-8') as output_file:
    output_file.write(folder_text)

print("Folder structure and content copied to text successfully.")
