using UnityEngine;

public class followplayer : MonoBehaviour
{

    public Transform follow;
    public Vector3 pos;
   
    void Update()
    {
        transform.position = follow.position + pos;
    }
}
