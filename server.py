import socket

try:
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("localhost", 9999))

    server.listen()

    client, addr = server.accept()

    done = False

    while not done:
        msg = client.recv(1024).decode('utf-8')
        if msg == 'quit':
            done = True
        else:
            print(msg)
            client.send(input("Message: ").encode('utf-8'))


except Exception as e:
    print(f"An error occurred: {e}")
