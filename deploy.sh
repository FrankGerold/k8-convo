docker build -t callipygious/multi-client:latest -t callipygious/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t callipygious/multi-server:latest -t callipygious/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t callipygious/multi-worker:latest -t callipygious/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push callipygious/multi-client:latest
docker push callipygious/multi-worker:latest
docker push callipygious/multi-server:latest
docker push callipygious/multi-client:$SHA
docker push callipygious/multi-worker:$SHA
docker push callipygious/multi-server:$SHA

kubectl apply -f k8s

kubectl set image deployments/server-deployment server=callipygious/multi-server:$SHA
kubectl set image deployments/client-deployment client=callipygious/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=callipygious/multi-worker:$SHA
